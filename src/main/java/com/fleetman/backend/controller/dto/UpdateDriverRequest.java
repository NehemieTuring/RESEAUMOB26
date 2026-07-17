package com.fleetman.backend.controller.dto;

public record UpdateDriverRequest(String firstName, String lastName, String phone,
                                  String licenceNumber, String status) {}
