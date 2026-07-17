package com.fleetman.backend.service;

import com.fleetman.backend.entity.GeofencePointEntity;
import com.fleetman.backend.entity.GeofencePointZoneLinkageEntity;
import com.fleetman.backend.entity.GeofenceZoneEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.GeofencePointRepository;
import com.fleetman.backend.repository.GeofencePointZoneLinkageRepository;
import com.fleetman.backend.repository.GeofenceZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Gestion locale des zones geographiques (remplace le service Geofence externe). */
@Service
public class InternalGeofenceService {

    private final GeofenceZoneRepository zoneRepository;
    private final GeofencePointRepository pointRepository;
    private final GeofencePointZoneLinkageRepository linkageRepository;

    public InternalGeofenceService(GeofenceZoneRepository zoneRepository,
                                   GeofencePointRepository pointRepository,
                                   GeofencePointZoneLinkageRepository linkageRepository) {
        this.zoneRepository = zoneRepository;
        this.pointRepository = pointRepository;
        this.linkageRepository = linkageRepository;
    }

    @Transactional
    public GeofenceZoneEntity createZone(GeofenceZoneEntity zone, UUID managerId) {
        zone.setManagerId(managerId);
        zone.setDeleted(false);
        return zoneRepository.save(zone);
    }

    @Transactional
    public GeofenceZoneEntity updateZone(UUID zoneId, Map<String, Object> updates) {
        GeofenceZoneEntity z = getActive(zoneId);
        updates.forEach((k, val) -> {
            switch (k) {
                case "name" -> z.setName((String) val);
                case "description" -> z.setDescription((String) val);
                case "zoneType" -> z.setZoneType((String) val);
                case "radius" -> z.setRadius(val == null ? null : new BigDecimal(val.toString()));
                default -> { }
            }
        });
        return zoneRepository.save(z);
    }

    @Transactional
    public void deleteZone(UUID zoneId) {
        GeofenceZoneEntity z = getActive(zoneId);
        z.setDeleted(true);
        zoneRepository.save(z);
    }

    public List<GeofenceZoneEntity> getZonesByManager(UUID managerId) {
        return zoneRepository.findByManagerIdAndDeletedFalse(managerId);
    }

    public List<GeofenceZoneEntity> listZones(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) {
            return zoneRepository.findByDeletedFalse();
        }
        return zoneRepository.findByZoneTypeAndDeletedFalse(category.toUpperCase());
    }

    /** Point-in-zone : distance au centre pour un cercle, ray-casting pour un polygone. */
    public boolean checkPointInZone(UUID zoneId, double lat, double lng) {
        GeofenceZoneEntity zone = getActive(zoneId);
        List<GeofencePointZoneLinkageEntity> links =
                linkageRepository.findByZoneIdOrderByVertexOrder(zoneId);

        if ("CIRCLE".equalsIgnoreCase(zone.getZoneType())) {
            if (links.isEmpty() || zone.getRadius() == null) return false;
            GeofencePointEntity center = pointRepository.findById(links.get(0).getPointId()).orElse(null);
            if (center == null) return false;
            double dist = haversine(lat, lng,
                    center.getLatitude().doubleValue(), center.getLongitude().doubleValue());
            return dist <= zone.getRadius().doubleValue();
        }

        // Polygone : ray casting
        double[] xs = new double[links.size()];
        double[] ys = new double[links.size()];
        for (int i = 0; i < links.size(); i++) {
            GeofencePointEntity p = pointRepository.findById(links.get(i).getPointId()).orElse(null);
            if (p == null) return false;
            xs[i] = p.getLongitude().doubleValue();
            ys[i] = p.getLatitude().doubleValue();
        }
        return pointInPolygon(lng, lat, xs, ys);
    }

    public GeofenceZoneEntity getActive(UUID zoneId) {
        GeofenceZoneEntity z = zoneRepository.findById(zoneId)
                .orElseThrow(() -> OperationException.notFound(zoneId));
        if (z.isDeleted()) throw OperationException.notFound(zoneId);
        return z;
    }

    private boolean pointInPolygon(double x, double y, double[] xs, double[] ys) {
        boolean inside = false;
        int n = xs.length;
        for (int i = 0, j = n - 1; i < n; j = i++) {
            if ((ys[i] > y) != (ys[j] > y)
                    && x < (xs[j] - xs[i]) * (y - ys[i]) / (ys[j] - ys[i]) + xs[i]) {
                inside = !inside;
            }
        }
        return inside;
    }

    /** Distance Haversine en metres. */
    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
