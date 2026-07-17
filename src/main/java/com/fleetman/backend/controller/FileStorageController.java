package com.fleetman.backend.controller;

import com.fleetman.backend.service.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "24. Fichiers")
@RestController
@RequestMapping("/api/v1/files")
public class FileStorageController {

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

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, String>> upload(Authentication auth,
                                                      @RequestParam("file") MultipartFile file,
                                                      @RequestParam(value = "type", required = false) String type) {
        String url = service.store(file, SecurityUtils.getUserId(auth), "USER",
                type != null ? type : "GENERIC");
        return ResponseEntity.ok(Map.of("url", url));
    }
}
