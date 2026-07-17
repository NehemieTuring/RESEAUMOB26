package com.fleetman.backend.exception;

public class FleetException extends DomainException {
    private FleetException(String message, int status, String code) { super(message, status, code); }
    public static FleetException notFound(Object id) { return new FleetException("Flotte introuvable (ID: " + id + ").", 404, "FLT_001"); }
    public static FleetException accessDenied() { return new FleetException("Acces refuse a cette flotte.", 403, "FLT_002"); }
    public static FleetException resourceAlreadyAssigned() { return new FleetException("La ressource est deja assignee.", 409, "FLT_003"); }
    public static FleetException cannotDeleteNotEmpty() { return new FleetException("Impossible de supprimer une flotte non vide.", 409, "FLT_004"); }
}
