package com.fleetman.backend.exception;

public class AuthException extends DomainException {
    private AuthException(String message, int status, String code) { super(message, status, code); }
    public static AuthException invalidCredentials() { return new AuthException("Identifiants invalides.", 401, "AUTH_001"); }
    public static AuthException userNotFound() { return new AuthException("Utilisateur introuvable.", 404, "AUTH_002"); }
    public static AuthException tokenExpired() { return new AuthException("Le jeton a expire.", 401, "AUTH_003"); }
    public static AuthException accountDisabled() { return new AuthException("Compte desactive.", 403, "AUTH_004"); }
    public static AuthException emailAlreadyUsed() { return new AuthException("Cet email est deja utilise.", 409, "AUTH_005"); }
    public static AuthException invalidToken() { return new AuthException("Jeton invalide.", 401, "AUTH_006"); }
}
