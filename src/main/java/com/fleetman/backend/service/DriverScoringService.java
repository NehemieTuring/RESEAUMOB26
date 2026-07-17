package com.fleetman.backend.service;

import com.fleetman.backend.entity.DriverScoreEntity;
import com.fleetman.backend.exception.ScoringException;
import com.fleetman.backend.repository.DriverScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class DriverScoringService {

    private final DriverScoreRepository driverScoreRepository;

    public DriverScoringService(DriverScoreRepository driverScoreRepository) {
        this.driverScoreRepository = driverScoreRepository;
    }

    @Transactional
    public DriverScoreEntity create(DriverScoreEntity score) {
        computeFinalScore(score);
        return driverScoreRepository.save(score);
    }

    public List<DriverScoreEntity> listByDriver(UUID driverId) {
        return driverScoreRepository.findByDriverId(driverId);
    }

    public List<DriverScoreEntity> listByFleet(UUID fleetId) {
        return driverScoreRepository.findByFleetId(fleetId);
    }

    public DriverScoreEntity get(UUID id) {
        return driverScoreRepository.findById(id).orElseThrow(() -> ScoringException.notFound(id));
    }

    private void computeFinalScore(DriverScoreEntity s) {
        BigDecimal sum = BigDecimal.ZERO;
        int n = 0;
        for (BigDecimal v : List.of(
                nz(s.getSafetyScore()), nz(s.getEfficiencyScore()), nz(s.getPunctualityScore()),
                nz(s.getComplianceScore()), nz(s.getFuelEfficiencyScore()))) {
            sum = sum.add(v);
            n++;
        }
        BigDecimal finalScore = n == 0 ? BigDecimal.ZERO
                : sum.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
        s.setFinalScore(finalScore);
        s.setBadge(badgeFor(finalScore));
    }

    private String badgeFor(BigDecimal score) {
        double v = score.doubleValue();
        if (v >= 90) return "GOLD";
        if (v >= 75) return "SILVER";
        if (v >= 50) return "BRONZE";
        return "NONE";
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
