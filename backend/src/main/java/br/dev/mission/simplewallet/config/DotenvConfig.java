package br.dev.mission.simplewallet.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;

import java.util.HashMap;
import java.util.Map;


public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        try {
            // Carrega o arquivo .env do diretório raiz do projeto backend
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            Map<String, Object> envVars = new HashMap<>();
            
            // Adiciona todas as variáveis do .env ao ambiente do Spring
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                
                envVars.put(key, value);
                
                // Define também como propriedade do sistema para garantir disponibilidade
                System.setProperty(key, value);
            });

            // Adiciona as variáveis como uma nova source de propriedades com alta prioridade
            if (!envVars.isEmpty()) {
                environment.getPropertySources()
                        .addFirst(new MapPropertySource("dotenv-properties", envVars));
                
                System.out.println("✓ DotenvConfig: Carregadas " + envVars.size() + " variáveis do arquivo .env");
                
                // Debug: mostra algumas variáveis importantes
                System.out.println("✓ SPRING_PROFILES_ACTIVE: " + envVars.get("SPRING_PROFILES_ACTIVE"));
                System.out.println("✓ Porta configurada: " + envVars.get("PORT"));
                System.out.println("✓ Banco de dados: " + envVars.get("POSTGRES_DB"));
                
                // Lista todas as variáveis carregadas para debug
                if (envVars.containsKey("SHOW_ALL_VARIABLES") && Boolean.parseBoolean(envVars.get("SHOW_ALL_VARIABLES").toString())) {
                    System.out.println("🔍 Todas as variáveis do .env:");
                    envVars.forEach((key, value) -> System.out.println("  " + key + "=" + value));
                }
                
            } else {
                System.out.println("⚠ DotenvConfig: Nenhuma variável encontrada no arquivo .env");
            }
            
        } catch (Exception e) {
            // Log do erro, mas não falha a aplicação se o .env não existir
            System.out.println("⚠ DotenvConfig: Não foi possível carregar o arquivo .env: " + e.getMessage());
            e.printStackTrace();
        }
    }
}