package com.wordgame.controller;

import com.wordgame.dto.GuessRequest;
import com.wordgame.entity.Game;
import com.wordgame.entity.Guess;
import com.wordgame.service.GameService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping("/start")
    public ResponseEntity<?> startGame(Principal principal) {
        try {
            Long userId = gameService.getUserIdByUsername(principal.getName());
            Game game = gameService.startNewGame(userId);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Daily limit")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "DAILY_LIMIT_REACHED", "message", e.getMessage()));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "GAME_START_FAILED", "message", e.getMessage()));
            }
        }
    }

    private static final int MAX_ATTEMPTS = 5;

    @PostMapping("/{gameId}/guess")
    public ResponseEntity<?> submitGuess(
            @PathVariable Long gameId,
            @RequestBody GuessRequest request,
            Principal principal) {
        try {
            String username = principal.getName();
        Guess guess = gameService.submitGuess(
            gameId,
            request.getGuess().toUpperCase()
        );
            Game game = gameService.getGameById(gameId);
            Map<String, Object> response = Map.of(
                    "id", guess.getId(),
                    "guessWord", guess.getGuessWord(),
                    "guessNumber", guess.getGuessNumber(),
                    "evaluation", guess.getEvaluation(),
                    "createdAt", guess.getCreatedAt().toString(),
                    "gameStatus", getGameStatus(game),
                    "message", getGameMessage(game),
                    "isGameOver", game.getEndedAt() != null,
                    "attemptsLeft", MAX_ATTEMPTS - game.getAttempts()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    
    private String getGameMessage(Game game) {
        if (game.getEndedAt() == null) {
            int attemptsLeft = 5 - game.getAttempts();
            return attemptsLeft > 0 ? "Keep guessing! " + attemptsLeft + " attempts left." : "";
        } else if (game.isWon()) {
            return "🎉 Congratulations! You guessed the word correctly! Well done! 🎉";
        } else {
            return "😔 Better luck next time! The word was: " + game.getWord().getWord() + " 😔";
        }
    }

    @GetMapping("/{gameId}/guesses")
    public ResponseEntity<?> getGuesses(@PathVariable Long gameId, Principal principal) {
        try {
            List<Guess> guesses = gameService.getGuesses(gameId);
            // Convert to simple objects to avoid lazy loading issues
            var simpleGuesses = guesses.stream()
                .map(guess -> Map.of(
                    "id", (Object) guess.getId(),
                    "guessWord", (Object) guess.getGuessWord(),
                    "guessNumber", (Object) guess.getGuessNumber(),
                    "evaluation", (Object) guess.getEvaluation(),
                    "createdAt", (Object) guess.getCreatedAt().toString()
                ))
                .toList();
            return ResponseEntity.ok(simpleGuesses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/history")
    public ResponseEntity<?> getGameHistory(Principal principal) {
        try {
            Long userId = gameService.getUserIdByUsername(principal.getName());
            List<Game> games = gameService.getGameHistory(userId);
            // Only include completed games (endedAt != null)
            var historyResponse = games.stream()
                .filter(game -> game.getEndedAt() != null)
                .map(game -> {
                    List<String> guesses = gameService.getGuesses(game.getId())
                        .stream()
                        .map(Guess::getGuessWord)
                        .toList();
                    String endTime = game.getEndedAt() != null ? game.getEndedAt().toString() : "";
                    return Map.of(
                        "id", (Object) game.getId().toString(),
                        // Only show targetWord for completed games
                        "targetWord", (Object) game.getWord().getWord(),
                        "guesses", (Object) guesses,
                        "status", (Object) getGameStatus(game),
                        "startTime", (Object) game.getStartedAt().toString(),
                        "endTime", (Object) endTime
                    );
                })
                .toList();
            return ResponseEntity.ok(historyResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getGameStatusEndpoint(Principal principal) {
        try {
            Long userId = gameService.getUserIdByUsername(principal.getName());
            boolean dailyLimitReached = gameService.hasReachedDailyLimit(userId);
            Game incompleteGame = gameService.getCurrentIncompleteGame(userId);
            return ResponseEntity.ok(Map.of(
                "dailyLimitReached", dailyLimitReached,
                "hasIncompleteGame", incompleteGame != null,
                "incompleteGameId", incompleteGame != null ? incompleteGame.getId() : null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<?> getGame(@PathVariable Long gameId, Principal principal) {
        try {
            Game game = gameService.getGameById(gameId);
            Long userId = gameService.getUserIdByUsername(principal.getName());
            
            // Check if user owns this game
            if (!game.getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            List<Guess> guesses = gameService.getGuesses(gameId);
            
            return ResponseEntity.ok(Map.of(
                "id", game.getId(),
                "wordToGuess", game.getWord().getWord(),
                "gameStatus", getGameStatus(game),
                "attempts", game.getAttempts(),
                "guesses", guesses.stream()
                    .map(guess -> Map.of(
                        "guessWord", guess.getGuessWord(),
                        "evaluation", guess.getEvaluation(),
                        "guessNumber", guess.getGuessNumber()
                    ))
                    .toList(),
                "message", getGameMessage(game)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper to get game status as string
    private String getGameStatus(Game game) {
        if (game.getEndedAt() == null) {
            return "IN_PROGRESS";
        } else if (game.isWon()) {
            return "WON";
        } else {
            return "LOST";
        }
    }
}
