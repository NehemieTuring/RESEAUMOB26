package com.fleetman.backend.service;

import com.fleetman.backend.entity.ExpenseEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetService budgetService;

    public ExpenseService(ExpenseRepository expenseRepository, BudgetService budgetService) {
        this.expenseRepository = expenseRepository;
        this.budgetService = budgetService;
    }

    @Transactional
    public ExpenseEntity create(ExpenseEntity expense) {
        if (expense.getStatus() == null) expense.setStatus("PENDING");
        return expenseRepository.save(expense);
    }

    public List<ExpenseEntity> list(UUID fleetId, UUID managerId) {
        if (fleetId != null) return expenseRepository.findByFleetIdAndDeletedFalse(fleetId);
        if (managerId != null) return expenseRepository.findByManagerIdAndDeletedFalse(managerId);
        return expenseRepository.findByDeletedFalse();
    }

    public ExpenseEntity get(UUID id) {
        return expenseRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
    }

    @Transactional
    public ExpenseEntity approve(UUID id) {
        ExpenseEntity e = get(id);
        e.setStatus("APPROVED");
        expenseRepository.save(e);
        // Workflow : imputer le budget de la flotte
        if (e.getFleetId() != null) {
            budgetService.consume("FLEET", e.getFleetId(), e.getAmount());
        }
        return e;
    }

    @Transactional
    public ExpenseEntity reject(UUID id, String reason) {
        ExpenseEntity e = get(id);
        e.setStatus("REJECTED");
        e.setRejectReason(reason);
        return expenseRepository.save(e);
    }

    @Transactional
    public void delete(UUID id) {
        ExpenseEntity e = get(id);
        e.setDeleted(true);
        expenseRepository.save(e);
    }
}
