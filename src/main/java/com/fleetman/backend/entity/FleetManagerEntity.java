package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "fleet_managers", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetManagerEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(name = "company_phone", length = 50)
    private String companyPhone;

    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "company_city", length = 100)
    private String companyCity;

    @Column(name = "company_logo_url", length = 512)
    private String companyLogoUrl;
}
