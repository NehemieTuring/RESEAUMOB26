package com.fleetman.backend.exception;

public class BudgetException extends DomainException {
    private BudgetException(String message, int status, String code) { super(message, status, code); }
    public static BudgetException notFound(Object id) { return new BudgetException("Budget introuvable (ID: " + id + ").", 404, "BDG_001"); }
    public static BudgetException accessDenied() { return new BudgetException("Acces refuse.", 403, "BDG_002"); }
    public static BudgetException invalid(String message) { return new BudgetException(message, 400, "BDG_003"); }
    public static BudgetException conflict(String message) { return new BudgetException(message, 409, "BDG_004"); }
}
