# Use Temurin JDK 21 as base image for building the application
FROM eclipse-temurin:21-jdk AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and Maven wrapper files
COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./

# Tornar o mvnw executável
RUN chmod +x ./mvnw

# Baixar dependências (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar a aplicação
RUN ./mvnw clean package -DskipTests

# Usar uma imagem leve para executar a aplicação
FROM eclipse-temurin:21-jre

# Definir diretório de trabalho
WORKDIR /app

# Copiar o JAR compilado da imagem de build
COPY --from=build /app/target/simplewallet-0.0.1-SNAPSHOT.jar app.jar

# Definir variáveis de ambiente
EXPOSE 8080

# Comando para executar a aplicação
CMD ["java", "-jar", "app.jar"]