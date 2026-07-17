package com.fleetman.backend.exception;

public class VehicleException extends DomainException {
    private VehicleException(String message, int status, String code) { super(message, status, code); }
    public static VehicleException plateConflict(String plate) { return new VehicleException("La plaque '" + plate + "' est deja utilisee.", 409, "VHC_001"); }
    public static VehicleException invalidVehicleType() { return new VehicleException("Type de vehicule invalide.", 400, "VHC_002"); }
    public static VehicleException notFound(Object id) { return new VehicleException("Vehicule introuvable (ID: " + id + ").", 404, "VHC_004"); }
    public static VehicleException accessDenied() { return new VehicleException("Acces refuse a ce vehicule.", 403, "VHC_006"); }
    public static VehicleException notAvailable() { return new VehicleException("Le vehicule n'est pas disponible.", 409, "VHC_007"); }
}
