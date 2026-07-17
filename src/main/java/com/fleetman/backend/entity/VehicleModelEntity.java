package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_models", schema = "fleet")
@NoArgsConstructor
public class VehicleModelEntity extends LookupEntity {}
