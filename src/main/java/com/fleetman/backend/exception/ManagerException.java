package com.fleetman.backend.exception;

public class ManagerException extends DomainException {
    private ManagerException(String message, int status, String code) { super(message, status, code); }
    public static ManagerException notFound(Object id) { return new ManagerException("Manager introuvable (ID: " + id + ").", 404, "MGR_001"); }
    public static ManagerException accessDenied() { return new ManagerException("Acces refuse.", 403, "MGR_002"); }
    public static ManagerException invalid(String message) { return new ManagerException(message, 400, "MGR_003"); }
    public static ManagerException conflict(String message) { return new ManagerException(message, 409, "MGR_004"); }
}
