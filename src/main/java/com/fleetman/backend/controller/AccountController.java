package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.ChangePasswordRequest;
import com.fleetman.backend.controller.dto.UpdateProfileRequest;
import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.service.InternalAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "02. Mon Compte")
@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final InternalAuthService authService;

    public AccountController(InternalAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/profile")
    public ResponseEntity<UserDetail> updateProfile(Authentication auth,
                                                    @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateUserProfile(SecurityUtils.getUserId(auth), req));
    }

    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(Authentication auth,
                                               @RequestBody ChangePasswordRequest req) {
        authService.changePassword(SecurityUtils.getUserId(auth),
                req.currentPassword(), req.newPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/photo")
    public ResponseEntity<UserDetail> updatePhoto(Authentication auth,
                                                 @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(authService.updateProfilePicture(SecurityUtils.getUserId(auth), file));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(Authentication auth) {
        authService.deleteAccount(SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}
