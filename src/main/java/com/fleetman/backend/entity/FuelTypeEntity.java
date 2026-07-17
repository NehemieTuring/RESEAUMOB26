package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fuel_types", schema = "fleet")
@NoArgsConstructor
public class FuelTypeEntity extends LookupEntity {}
