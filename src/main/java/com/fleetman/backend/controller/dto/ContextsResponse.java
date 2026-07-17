package com.fleetman.backend.controller.dto;

import java.util.List;
import java.util.UUID;

public record ContextsResponse(String selectionToken, long expiresInSeconds, List<ContextInfo> contexts) {
    public record ContextInfo(String contextId, String name, UUID organizationId) {}
}
