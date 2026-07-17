package com.fleetman.backend.controller.dto;

import java.util.UUID;

public record SelectContextRequest(String selectionToken, String contextId, UUID organizationId) {}
