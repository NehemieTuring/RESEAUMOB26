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
    public ExpenseEntity create(ExpenseEntity expense, UUID managerId) {
        if (expense.getStatus() == null) expense.setStatus("PENDING");
        expense.setManagerId(managerId);
        return expenseRepository.save(expense);
    }

    public List<ExpenseEntity> list(UUID fleetId, UUID managerId) {
        List<ExpenseEntity> list = managerId != null
                ? expenseRepository.findByManagerIdAndDeletedFalse(managerId)
                : expenseRepository.findByDeletedFalse();
        if (fleetId != null) {
            return list.stream().filter(e -> fleetId.equals(e.getFleetId())).toList();
        }
        return list;
    }

    public ExpenseEntity get(UUID id, UUID managerId) {
        ExpenseEntity e = expenseRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
        if (managerId != null) {
            com.fleetman.backend.controller.SecurityUtils.requireOwnership(e.getManagerId(), managerId);
        }
        return e;
    }

    @Transactional
    public ExpenseEntity approve(UUID id, UUID managerId) {
        ExpenseEntity e = get(id, managerId);
        e.setStatus("APPROVED");
        expenseRepository.save(e);
        // Workflow : imputer le budget de la flotte
        if (e.getFleetId() != null) {
            budgetService.consume("FLEET", e.getFleetId(), e.getAmount());
        }
        return e;
    }

    @Transactional
    public ExpenseEntity reject(UUID id, String reason, UUID managerId) {
        ExpenseEntity e = get(id, managerId);
        e.setStatus("REJECTED");
        e.setRejectReason(reason);
        return expenseRepository.save(e);
    }

    @Transactional
    public void delete(UUID id, UUID managerId) {
        ExpenseEntity e = get(id, managerId);
        e.setDeleted(true);
        expenseRepository.save(e);
    }
}
