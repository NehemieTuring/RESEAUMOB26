package com.fleetman.backend.controller.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
