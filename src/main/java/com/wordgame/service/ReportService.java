package com.wordgame.service;

import com.wordgame.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final GameRepository gameRepository;

    public long countGamesForUserOnDate(Long userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return gameRepository.countByUserIdAndStartedAtBetween(userId, start, end);
    }

    public long countWinsOnDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return gameRepository.countByWonTrueAndStartedAtBetween(start, end);
    }

    public long countUniquePlayers(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return gameRepository.countDistinctUsersByStartedAtBetween(start, end);
    }
}
