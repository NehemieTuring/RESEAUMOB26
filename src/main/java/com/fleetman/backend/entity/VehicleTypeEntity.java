package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_types", schema = "fleet")
@NoArgsConstructor
public class VehicleTypeEntity extends LookupEntity {}
