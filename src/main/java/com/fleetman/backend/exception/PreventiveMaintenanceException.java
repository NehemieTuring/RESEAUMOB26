package com.fleetman.backend.exception;

public class PreventiveMaintenanceException extends DomainException {
    private PreventiveMaintenanceException(String message, int status, String code) { super(message, status, code); }
    public static PreventiveMaintenanceException notFound(Object id) { return new PreventiveMaintenanceException("Maintenance preventive introuvable (ID: " + id + ").", 404, "PMT_001"); }
    public static PreventiveMaintenanceException accessDenied() { return new PreventiveMaintenanceException("Acces refuse.", 403, "PMT_002"); }
    public static PreventiveMaintenanceException invalid(String message) { return new PreventiveMaintenanceException(message, 400, "PMT_003"); }
    public static PreventiveMaintenanceException conflict(String message) { return new PreventiveMaintenanceException(message, 409, "PMT_004"); }
}
