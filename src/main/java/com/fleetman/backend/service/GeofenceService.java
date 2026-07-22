package com.fleetman.backend.service;

import com.fleetman.backend.entity.GeofenceEventEntity;
import com.fleetman.backend.entity.GeofenceZoneEntity;
import com.fleetman.backend.repository.GeofenceEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Facade metier des zones geographiques, s'appuyant sur InternalGeofenceService. */
@Service
public class GeofenceService {

    private final InternalGeofenceService internalGeofenceService;
    private final GeofenceEventRepository eventRepository;

    public GeofenceService(InternalGeofenceService internalGeofenceService,
                           GeofenceEventRepository eventRepository) {
        this.internalGeofenceService = internalGeofenceService;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public GeofenceZoneEntity createZone(GeofenceZoneEntity zone, UUID managerId) {
        return internalGeofenceService.createZone(zone, managerId);
    }

    @Transactional
    public GeofenceZoneEntity updateZone(UUID zoneId, Map<String, Object> updates, UUID managerId, boolean isAdmin, UUID orgId) {
        return internalGeofenceService.updateZone(zoneId, updates, managerId, isAdmin, orgId);
    }

    @Transactional
    public void deleteZone(UUID zoneId, UUID managerId, boolean isAdmin, UUID orgId) {
        internalGeofenceService.deleteZone(zoneId, managerId, isAdmin, orgId);
    }

    public List<GeofenceZoneEntity> getZonesByManager(UUID managerId, boolean isAdmin, UUID orgId) {
        return internalGeofenceService.getZonesByManager(managerId, isAdmin, orgId);
    }

    public List<GeofenceZoneEntity> listZones(String category, UUID managerId, boolean isAdmin, UUID orgId) {
        return internalGeofenceService.listZones(category, managerId, isAdmin, orgId);
    }

    public boolean checkPointInZone(UUID zoneId, double lat, double lng, UUID managerId, boolean isAdmin, UUID orgId) {
        return internalGeofenceService.checkPointInZone(zoneId, lat, lng, managerId, isAdmin, orgId);
    }

    public List<GeofenceEventEntity> eventsByVehicle(UUID vehicleId) {
        return eventRepository.findByVehicleId(vehicleId);
    }
}
