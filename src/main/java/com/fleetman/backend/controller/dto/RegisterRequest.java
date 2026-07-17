package com.fleetman.backend.controller.dto;

import java.util.List;

public record RegisterRequest(String username, String password, String email, String phone,
                              String firstName, String lastName, List<String> roles) {}
