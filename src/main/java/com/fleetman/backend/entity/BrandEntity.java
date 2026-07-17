package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "brands", schema = "fleet")
@NoArgsConstructor
public class BrandEntity extends LookupEntity {}
