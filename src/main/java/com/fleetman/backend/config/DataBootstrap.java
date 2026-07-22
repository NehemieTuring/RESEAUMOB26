package com.fleetman.backend.config;

import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.entity.UserRoleEntity;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.UserRoleRepository;
import com.fleetman.backend.entity.OrganizationEntity;
import com.fleetman.backend.repository.OrganizationRepository;
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
    private final OrganizationRepository organizationRepository;

    @Value("${app.bootstrap.admin.username}") private String username;
    @Value("${app.bootstrap.admin.email}") private String email;
    @Value("${app.bootstrap.admin.password}") private String password;
    @Value("${app.bootstrap.admin.phone}") private String phone;
    @Value("${app.bootstrap.admin.firstname}") private String firstName;
    @Value("${app.bootstrap.admin.lastname}") private String lastName;

    public DataBootstrap(UserRepository userRepository, UserRoleRepository userRoleRepository,
                         PasswordEncoder passwordEncoder, OrganizationRepository organizationRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.organizationRepository = organizationRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        UserEntity admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null) {
            OrganizationEntity org = organizationRepository.save(OrganizationEntity.builder()
                    .name("Organisation de " + firstName + " " + lastName)
                    .build());
            
            admin = UserEntity.builder()
                    .username(username)
                    .email(email)
                    .phone(phone)
                    .firstName(firstName)
                    .lastName(lastName)
                    .passwordHash(passwordEncoder.encode(password))
                    .isActive(true)
                    .organizationId(org.getId())
                    .build();
            admin = userRepository.save(admin);
            userRoleRepository.save(UserRoleEntity.builder()
                    .userId(admin.getId()).role("FLEET_SUPER_ADMIN").build());
            log.info("Compte super-admin cree : {}", email);
        } else if (admin.getOrganizationId() == null) {
            OrganizationEntity org = organizationRepository.save(OrganizationEntity.builder()
                    .name("Organisation de " + admin.getFirstName() + " " + admin.getLastName())
                    .build());
            admin.setOrganizationId(org.getId());
            admin = userRepository.save(admin);
            log.info("Assigned new organizationId to existing super-admin");
        }

        final java.util.UUID adminOrgId = admin.getOrganizationId();
        
        // Backfill for all other users
        java.util.List<UserEntity> allUsers = userRepository.findAll();
        for (UserEntity u : allUsers) {
            if (u.getOrganizationId() == null) {
                OrganizationEntity org = organizationRepository.save(OrganizationEntity.builder()
                        .name("Org " + java.util.UUID.randomUUID().toString().substring(0, 8))
                        .build());
                u.setOrganizationId(org.getId());
                userRepository.save(u);
            }
        }
    }
}
