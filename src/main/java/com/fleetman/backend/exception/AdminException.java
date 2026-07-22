package com.fleetman.backend.exception;

public class AdminException extends DomainException {
    private AdminException(String message, int status, String code) { super(message, status, code); }
    public static AdminException notFound(Object id) { return new AdminException("Administration introuvable (ID: " + id + ").", 404, "ADM_001"); }
    public static AdminException accessDenied() { return new AdminException("Acces refuse.", 403, "ADM_002"); }
    public static AdminException invalid(String message) { return new AdminException(message, 400, "ADM_003"); }
    public static AdminException conflict(String message) { return new AdminException(message, 409, "ADM_004"); }
    public static AdminException forbidden(String message) { return new AdminException(message, 403, "ADM_005"); }
}
