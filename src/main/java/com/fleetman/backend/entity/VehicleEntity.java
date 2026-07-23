package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vehicles", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id", nullable = false)
    private UUID managerId;

    @Column(name = "current_driver_id")
    private UUID currentDriverId;

    @Column(name = "vehicle_type_id")
    private UUID vehicleTypeId;

    @Column(name = "license_plate", length = 50, unique = true, nullable = false)
    private String licensePlate;

    @Column(name = "vehicle_serial_number", length = 100)
    private String vehicleSerialNumber;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "manufacturing_year")
    private Integer manufacturingYear;

    @Column(name = "transmission_type", length = 50)
    private String transmissionType;

    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "tank_capacity")
    private Double tankCapacity;

    @Column(name = "total_seat_number")
    private Integer totalSeatNumber;

    @Column(name = "average_fuel_consumption")
    private Double averageFuelConsumption;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "AVAILABLE";

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "serial_number_photo_url")
    private String serialNumberPhotoUrl;

    @Column(name = "registration_photo_url")
    private String registrationPhotoUrl;

    @Column(name = "geofence_remote_id")
    private String geofenceRemoteId;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private java.time.Instant deletedAt;

    public String getStatus() {
        if (currentDriverId != null && "AVAILABLE".equals(this.status)) {
            return "OCCUPIED";
        }
        return this.status;
    }
}
