package br.dev.mission.simplewallet.model;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Component
public class UserEntityListener implements ApplicationContextAware {
    private static ApplicationContext context;

    @Override
    public void setApplicationContext(@SuppressWarnings("null") ApplicationContext applicationContext) {
        context = applicationContext;
    }

    @PrePersist
    @PreUpdate
    public void hashPassword(User user) {
        if (user.getPassword() == null) return;
        PasswordEncoder encoder = context.getBean(PasswordEncoder.class);
        String password = user.getPassword();
        
        if (!password.startsWith("$2a$") && !password.startsWith("$2b$") && !password.startsWith("$2y$")) {
            user.setPassword(encoder.encode(password));
        }
    }
}
