package com.fleetman.backend.controller.dto;

public record ResetPasswordRequest(String resetToken, String newPassword) {}
