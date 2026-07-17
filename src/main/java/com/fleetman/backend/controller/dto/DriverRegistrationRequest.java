package com.fleetman.backend.controller.dto;

public record DriverRegistrationRequest(String username, String email, String phone, String firstName,
                                        String lastName, String password, String licenceNumber) {}
