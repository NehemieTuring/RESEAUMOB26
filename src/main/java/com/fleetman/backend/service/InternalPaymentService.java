package com.fleetman.backend.service;

import com.fleetman.backend.entity.WalletEntity;
import com.fleetman.backend.entity.WalletTransactionEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.WalletRepository;
import com.fleetman.backend.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Portefeuilles internes remplacant le service Payment externe. */
@Service
public class InternalPaymentService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public InternalPaymentService(WalletRepository walletRepository,
                                  WalletTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getBalance(UUID ownerId) {
        return walletRepository.findByOwnerId(ownerId)
                .map(WalletEntity::getBalance)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public WalletEntity initializeWallet(UUID ownerId, String ownerName) {
        return walletRepository.findByOwnerId(ownerId).orElseGet(() ->
                walletRepository.save(WalletEntity.builder()
                        .ownerId(ownerId).ownerName(ownerName)
                        .balance(BigDecimal.ZERO).build()));
    }

    @Transactional
    public BigDecimal debitWallet(UUID ownerId, BigDecimal amount) {
        WalletEntity wallet = walletRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> OperationException.notFound(ownerId));
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw OperationException.conflict("Solde insuffisant.");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);
        recordTransaction(wallet.getId(), "DEBIT", amount, "Debit portefeuille");
        return wallet.getBalance();
    }

    @Transactional
    public BigDecimal creditWallet(UUID ownerId, BigDecimal amount) {
        WalletEntity wallet = walletRepository.findByOwnerId(ownerId)
                .orElseGet(() -> initializeWallet(ownerId, null));
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        recordTransaction(wallet.getId(), "CREDIT", amount, "Credit portefeuille");
        return wallet.getBalance();
    }

    public List<WalletTransactionEntity> getTransactions(UUID ownerId) {
        return walletRepository.findByOwnerId(ownerId)
                .map(w -> transactionRepository.findByWalletIdOrderByCreatedAtDesc(w.getId()))
                .orElse(List.of());
    }

    private void recordTransaction(UUID walletId, String type, BigDecimal amount, String desc) {
        transactionRepository.save(WalletTransactionEntity.builder()
                .walletId(walletId).type(type).amount(amount).description(desc).build());
    }
}
