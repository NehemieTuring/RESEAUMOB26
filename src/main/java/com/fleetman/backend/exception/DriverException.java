package com.fleetman.backend.exception;

public class DriverException extends DomainException {
    private DriverException(String message, int status, String code) { super(message, status, code); }
    public static DriverException notFound(Object id) { return new DriverException("Chauffeur introuvable (ID: " + id + ").", 404, "DRV_001"); }
    public static DriverException accessDenied() { return new DriverException("Acces refuse a ce chauffeur.", 403, "DRV_002"); }
    public static DriverException licenceConflict() { return new DriverException("Ce numero de permis est deja utilise.", 409, "DRV_003"); }
    public static DriverException notActive() { return new DriverException("Le chauffeur n'est pas actif.", 409, "DRV_004"); }
    public static DriverException alreadyAssigned() { return new DriverException("Le chauffeur a deja un vehicule assigne.", 409, "DRV_005"); }
}
