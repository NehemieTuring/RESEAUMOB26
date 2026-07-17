package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.service.InternalAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "01. Authentification")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final InternalAuthService authService;

    public AuthController(InternalAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.identifier(), req.password()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refreshToken(req.refreshToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetail> me(Authentication auth) {
        return ResponseEntity.ok(authService.me(SecurityUtils.getUserId(auth)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        // Pas d'envoi d'email en monolithe : operation idempotente cote client.
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/discover-contexts")
    public ResponseEntity<ContextsResponse> discoverContexts(@RequestBody DiscoverContextsRequest req) {
        return ResponseEntity.ok(authService.discoverContexts(req.principal(), req.password()));
    }

    @PostMapping("/select-context")
    public ResponseEntity<AuthResponse> selectContext(@RequestBody SelectContextRequest req) {
        return ResponseEntity.ok(
                authService.selectContext(req.selectionToken(), req.contextId(), req.organizationId()));
    }
}
