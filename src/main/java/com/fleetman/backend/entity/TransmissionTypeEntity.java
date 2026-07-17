package com.fleetman.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transmission_types", schema = "fleet")
@NoArgsConstructor
public class TransmissionTypeEntity extends LookupEntity {}
