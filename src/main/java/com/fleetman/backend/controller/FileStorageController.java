package com.fleetman.backend.controller;

import com.fleetman.backend.entity.StoredFileEntity;
import com.fleetman.backend.service.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "24. Fichiers")
@RestController
@RequestMapping("/api/v1/files")
public class FileStorageController {

    /**
     * Types MIME acceptes pour un upload ANONYME (parcours d'inscription).
     * Les utilisateurs authentifies ne sont pas soumis a cette restriction.
     */
    private static final List<String> ANONYMOUS_ALLOWED_TYPES = List.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf");

    private final FileStorageService service;

    public FileStorageController(FileStorageService service) {
        this.service = service;
    }

    @GetMapping("/{name}")
    public ResponseEntity<byte[]> download(@PathVariable String name) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(service.load(name));
    }

    /**
     * Upload d'un fichier. Accessible sans authentification pour permettre le depot
     * des pieces justificatives pendant l'inscription (le compte n'existe pas encore).
     */
    @PostMapping(path = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> upload(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "type", required = false) String type) {

        UUID ownerId = SecurityUtils.getUserId(auth);
        boolean anonymous = ownerId == null;

        if (anonymous) {
            String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
            if (!ANONYMOUS_ALLOWED_TYPES.contains(contentType)) {
                throw new IllegalArgumentException(
                        "Type de fichier non autorise : " + contentType + ". Formats acceptes : images ou PDF.");
            }
        }

        String fileType = category != null ? category : (type != null ? type : "GENERIC");
        StoredFileEntity stored = service.storeAndDescribe(
                file, ownerId, anonymous ? "ANONYMOUS" : "USER", fileType);

        // Format de reponse attendu par le client mobile / web.
        Map<String, Object> body = new HashMap<>();
        body.put("fileUrl", "/api/v1/files/" + stored.getStoredPath());
        body.put("originalName", stored.getOriginalName());
        body.put("mimeType", stored.getContentType());
        body.put("sizeBytes", stored.getSizeBytes());
        // Alias historique conserve pour compatibilite ascendante.
        body.put("url", "/api/v1/files/" + stored.getStoredPath());
        return ResponseEntity.ok(body);
    }
}
