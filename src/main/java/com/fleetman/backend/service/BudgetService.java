package com.fleetman.backend.service;

import com.fleetman.backend.entity.BudgetEntity;
import com.fleetman.backend.exception.BudgetException;
import com.fleetman.backend.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Transactional
    public BudgetEntity create(BudgetEntity budget) {
        if (budget.getConsumed() == null) budget.setConsumed(BigDecimal.ZERO);
        refreshAlertLevel(budget);
        return budgetRepository.save(budget);
    }

    public List<BudgetEntity> listByManager(UUID managerId) {
        return budgetRepository.findByManagerId(managerId);
    }

    public BudgetEntity get(UUID id) {
        return budgetRepository.findById(id).orElseThrow(() -> BudgetException.notFound(id));
    }

    @Transactional
    public BudgetEntity update(UUID id, BudgetEntity req) {
        BudgetEntity b = get(id);
        if (req.getAmount() != null) b.setAmount(req.getAmount());
        if (req.getNotes() != null) b.setNotes(req.getNotes());
        refreshAlertLevel(b);
        return budgetRepository.save(b);
    }

    @Transactional
    public void delete(UUID id) {
        budgetRepository.deleteById(id);
    }

    /** Incremente le consomme d'un budget correspondant a l'echelle/entite/mois. */
    @Transactional
    public void consume(String scope, UUID entityId, BigDecimal amount) {
        if (amount == null) return;
        LocalDate month = LocalDate.now().withDayOfMonth(1);
        budgetRepository.findByScopeAndEntityIdAndBudgetMonth(scope, entityId, month).ifPresent(b -> {
            b.setConsumed(b.getConsumed().add(amount));
            refreshAlertLevel(b);
            budgetRepository.save(b);
        });
    }

    private void refreshAlertLevel(BudgetEntity b) {
        if (b.getAmount() == null || b.getConsumed() == null) return;
        BigDecimal amount = b.getAmount();
        BigDecimal consumed = b.getConsumed();
        if (consumed.compareTo(amount) > 0) {
            b.setAlertLevel("EXCEEDED");
        } else if (consumed.compareTo(amount.multiply(BigDecimal.valueOf(0.8))) > 0) {
            b.setAlertLevel("WARNING");
        } else {
            b.setAlertLevel("OK");
        }
    }
}
