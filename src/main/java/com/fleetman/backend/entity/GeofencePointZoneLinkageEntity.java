package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "geofence_point_zone_linkages", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(GeofencePointZoneLinkageEntity.LinkageId.class)
public class GeofencePointZoneLinkageEntity {

    @Id
    @Column(name = "point_id")
    private UUID pointId;

    @Id
    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "vertex_order")
    private Integer vertexOrder;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkageId implements Serializable {
        private UUID pointId;
        private UUID zoneId;
    }
}
