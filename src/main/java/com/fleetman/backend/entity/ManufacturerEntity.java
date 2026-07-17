package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manufacturers", schema = "fleet")
@NoArgsConstructor
public class ManufacturerEntity extends LookupEntity {}
