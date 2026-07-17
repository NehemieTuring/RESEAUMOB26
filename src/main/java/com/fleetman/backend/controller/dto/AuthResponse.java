package com.fleetman.backend.controller.dto;

public record AuthResponse(String accessToken, String refreshToken, UserDetail user) {}
