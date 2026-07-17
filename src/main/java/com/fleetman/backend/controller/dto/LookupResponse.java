package com.fleetman.backend.controller.dto;

import java.util.UUID;

public record LookupResponse(UUID id, String code, String label, String description) {}
