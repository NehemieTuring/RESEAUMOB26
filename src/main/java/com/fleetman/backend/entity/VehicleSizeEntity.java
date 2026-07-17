package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_sizes", schema = "fleet")
@NoArgsConstructor
public class VehicleSizeEntity extends LookupEntity {}
