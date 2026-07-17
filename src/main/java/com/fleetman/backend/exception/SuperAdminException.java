package com.fleetman.backend.exception;

public class SuperAdminException extends DomainException {
    private SuperAdminException(String message, int status, String code) { super(message, status, code); }
    public static SuperAdminException notFound(Object id) { return new SuperAdminException("Super administration introuvable (ID: " + id + ").", 404, "SADM_001"); }
    public static SuperAdminException accessDenied() { return new SuperAdminException("Acces refuse.", 403, "SADM_002"); }
    public static SuperAdminException invalid(String message) { return new SuperAdminException(message, 400, "SADM_003"); }
    public static SuperAdminException conflict(String message) { return new SuperAdminException(message, 409, "SADM_004"); }
}
