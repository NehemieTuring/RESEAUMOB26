package com.fleetman.backend.exception;

public class ScoringException extends DomainException {
    private ScoringException(String message, int status, String code) { super(message, status, code); }
    public static ScoringException notFound(Object id) { return new ScoringException("Scoring introuvable (ID: " + id + ").", 404, "SCR_001"); }
    public static ScoringException accessDenied() { return new ScoringException("Acces refuse.", 403, "SCR_002"); }
    public static ScoringException invalid(String message) { return new ScoringException(message, 400, "SCR_003"); }
    public static ScoringException conflict(String message) { return new ScoringException(message, 409, "SCR_004"); }
}
