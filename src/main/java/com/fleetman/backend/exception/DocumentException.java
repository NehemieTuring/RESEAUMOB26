package com.fleetman.backend.exception;

public class DocumentException extends DomainException {
    private DocumentException(String message, int status, String code) { super(message, status, code); }
    public static DocumentException notFound(Object id) { return new DocumentException("Document introuvable (ID: " + id + ").", 404, "DOC_001"); }
    public static DocumentException accessDenied() { return new DocumentException("Acces refuse.", 403, "DOC_002"); }
    public static DocumentException invalid(String message) { return new DocumentException(message, 400, "DOC_003"); }
    public static DocumentException conflict(String message) { return new DocumentException(message, 409, "DOC_004"); }
}
