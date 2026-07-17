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
    public GeofenceZoneEntity updateZone(UUID zoneId, Map<String, Object> updates) {
        return internalGeofenceService.updateZone(zoneId, updates);
    }

    @Transactional
    public void deleteZone(UUID zoneId) {
        internalGeofenceService.deleteZone(zoneId);
    }

    public List<GeofenceZoneEntity> getZonesByManager(UUID managerId) {
        return internalGeofenceService.getZonesByManager(managerId);
    }

    public List<GeofenceZoneEntity> listZones(String category) {
        return internalGeofenceService.listZones(category);
    }

    public boolean checkPointInZone(UUID zoneId, double lat, double lng) {
        return internalGeofenceService.checkPointInZone(zoneId, lat, lng);
    }

    public List<GeofenceEventEntity> eventsByVehicle(UUID vehicleId) {
        return eventRepository.findByVehicleId(vehicleId);
    }
}
