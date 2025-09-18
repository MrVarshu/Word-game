package com.wordgame.controller;

import com.wordgame.repository.UserRepository;
import com.wordgame.repository.GameRepository;
import com.wordgame.repository.GuessRepository;
import com.wordgame.entity.User;
import com.wordgame.entity.Game;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;


import com.wordgame.repository.UserRepository;
import com.wordgame.repository.GameRepository;
import com.wordgame.repository.GuessRepository;
import com.wordgame.entity.User;
import com.wordgame.entity.Game;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private GuessRepository guessRepository;

    /**
     * Admin API: Get user activity summary by username or userId
     * Returns: [{date, numberOfWordsTried, numberOfCorrectGuesses}]
     */
    @GetMapping("/user/activity")
    public ResponseEntity<?> getUserActivitySummary(@RequestParam(required = false) Long userId,
                                                   @RequestParam(required = false) String username) {
        if (userId == null && (username == null || username.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Provide userId or username"));
        }
        Optional<User> userOpt = userId != null ? userRepository.findById(userId)
                : userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        List<Game> games = gameRepository.findByUser(user);
        // Group by date (yyyy-MM-dd)
        var summary = games.stream().collect(Collectors.groupingBy(
                g -> g.getStartedAt().toLocalDate().toString()
        )).entrySet().stream().map(e -> {
            String date = e.getKey();
            List<Game> dayGames = e.getValue();
            long wordsTried = dayGames.size();
            long correctGuesses = dayGames.stream().filter(Game::isWon).count();
            return Map.of(
                "date", date,
                "numberOfWordsTried", wordsTried,
                "numberOfCorrectGuesses", correctGuesses
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(summary);
    }

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
    long wins = reportService.countWinsForUserOnDate(userId, date);
    return ResponseEntity.ok(Map.of(
        "date", (long) date.toEpochDay(),
        "gamesPlayed", games,
        "wins", wins
    ));
    }
}
