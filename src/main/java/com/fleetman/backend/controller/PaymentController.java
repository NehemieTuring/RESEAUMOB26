package com.fleetman.backend.controller;

import com.fleetman.backend.entity.WalletTransactionEntity;
import com.fleetman.backend.service.InternalPaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "23. Paiements")
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final InternalPaymentService service;

    public PaymentController(InternalPaymentService service) {
        this.service = service;
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> balance(Authentication auth) {
        return ResponseEntity.ok(Map.of("balance", service.getBalance(SecurityUtils.getUserId(auth))));
    }

    @PostMapping("/credit")
    public ResponseEntity<Map<String, BigDecimal>> credit(Authentication auth, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal bal = service.creditWallet(SecurityUtils.getUserId(auth), body.get("amount"));
        return ResponseEntity.ok(Map.of("balance", bal));
    }

    @PostMapping("/debit")
    public ResponseEntity<Map<String, BigDecimal>> debit(Authentication auth, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal bal = service.debitWallet(SecurityUtils.getUserId(auth), body.get("amount"));
        return ResponseEntity.ok(Map.of("balance", bal));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionEntity>> transactions(Authentication auth) {
        return ResponseEntity.ok(service.getTransactions(SecurityUtils.getUserId(auth)));
    }
}
