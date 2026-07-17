package com.fleetman.backend.exception;

public class AlertException extends DomainException {
    private AlertException(String message, int status, String code) { super(message, status, code); }
    public static AlertException notFound(Object id) { return new AlertException("Alerte introuvable (ID: " + id + ").", 404, "ALT_001"); }
    public static AlertException accessDenied() { return new AlertException("Acces refuse.", 403, "ALT_002"); }
    public static AlertException invalid(String message) { return new AlertException(message, 400, "ALT_003"); }
    public static AlertException conflict(String message) { return new AlertException(message, 409, "ALT_004"); }
}
