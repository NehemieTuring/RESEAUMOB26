package com.fleetman.backend.exception;

public class TripException extends DomainException {
    private TripException(String message, int status, String code) { super(message, status, code); }
    public static TripException notFound(Object id) { return new TripException("Trajet introuvable (ID: " + id + ").", 404, "TRP_001"); }
    public static TripException invalidState(String expected, String actual) { return new TripException("Transition invalide : attendu " + expected + ", actuel " + actual + ".", 409, "TRP_002"); }
    public static TripException accessDenied() { return new TripException("Acces refuse a ce trajet.", 403, "TRP_003"); }
    public static TripException noActiveTrip() { return new TripException("Aucun trajet actif.", 404, "TRP_004"); }
}
