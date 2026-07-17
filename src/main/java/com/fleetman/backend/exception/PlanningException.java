package com.fleetman.backend.exception;

public class PlanningException extends DomainException {
    private PlanningException(String message, int status, String code) { super(message, status, code); }
    public static PlanningException notFound(Object id) { return new PlanningException("Planning introuvable (ID: " + id + ").", 404, "PLN_001"); }
    public static PlanningException accessDenied() { return new PlanningException("Acces refuse.", 403, "PLN_002"); }
    public static PlanningException invalid(String message) { return new PlanningException(message, 400, "PLN_003"); }
    public static PlanningException conflict(String message) { return new PlanningException(message, 409, "PLN_004"); }
}
