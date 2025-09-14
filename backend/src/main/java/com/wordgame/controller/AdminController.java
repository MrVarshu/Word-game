package com.wordgame.controller;

import com.wordgame.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReportService reportService;

    @GetMapping("/report/day")
    public ResponseEntity<Map<String, Long>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        long wins = reportService.countWinsOnDate(date);
        long players = reportService.countUniquePlayers(date);

        return ResponseEntity.ok(Map.of(
                "date", (long) date.toEpochDay(),
                "wins", wins,
                "uniquePlayers", players
        ));
    }

    @GetMapping("/report/user/{userId}")
    public ResponseEntity<Map<String, Long>> getUserReport(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        long games = reportService.countGamesForUserOnDate(userId, date);

        return ResponseEntity.ok(Map.of(
                "date", (long) date.toEpochDay(),
                "gamesPlayed", games
        ));
    }
}
