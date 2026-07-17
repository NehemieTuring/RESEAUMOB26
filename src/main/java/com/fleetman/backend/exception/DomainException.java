package com.fleetman.backend.exception;

import java.time.Instant;

public abstract class DomainException extends RuntimeException {

    private final int httpStatus;
    private final String businessCode;
    private final Instant timestamp = Instant.now();

    protected DomainException(String message, int httpStatus, String businessCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.businessCode = businessCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getBusinessCode() {
        return businessCode;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
