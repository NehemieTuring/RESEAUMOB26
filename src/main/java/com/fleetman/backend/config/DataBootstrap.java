package com.fleetman.backend.config;

import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.entity.UserRoleEntity;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataBootstrap.class);

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.username}") private String username;
    @Value("${app.bootstrap.admin.email}") private String email;
    @Value("${app.bootstrap.admin.password}") private String password;
    @Value("${app.bootstrap.admin.phone}") private String phone;
    @Value("${app.bootstrap.admin.firstname}") private String firstName;
    @Value("${app.bootstrap.admin.lastname}") private String lastName;

    public DataBootstrap(UserRepository userRepository, UserRoleRepository userRoleRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(email)) {
            log.info("Compte super-admin deja present ({})", email);
            return;
        }
        UserEntity admin = UserEntity.builder()
                .username(username)
                .email(email)
                .phone(phone)
                .firstName(firstName)
                .lastName(lastName)
                .passwordHash(passwordEncoder.encode(password))
                .isActive(true)
                .build();
        admin = userRepository.save(admin);
        userRoleRepository.save(UserRoleEntity.builder()
                .userId(admin.getId()).role("FLEET_SUPER_ADMIN").build());
        log.info("Compte super-admin cree : {}", email);
    }
}
