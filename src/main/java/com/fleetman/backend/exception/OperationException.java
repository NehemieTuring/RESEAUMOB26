package com.fleetman.backend.exception;

public class OperationException extends DomainException {
    private OperationException(String message, int status, String code) { super(message, status, code); }
    public static OperationException notFound(Object id) { return new OperationException("Operation introuvable (ID: " + id + ").", 404, "OPS_001"); }
    public static OperationException accessDenied() { return new OperationException("Acces refuse.", 403, "OPS_002"); }
    public static OperationException invalid(String message) { return new OperationException(message, 400, "OPS_003"); }
    public static OperationException conflict(String message) { return new OperationException(message, 409, "OPS_004"); }
}
