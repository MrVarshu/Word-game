package com.wordgame.controller;

import com.wordgame.entity.Game;
import com.wordgame.entity.Guess;
import com.wordgame.service.GameService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<Game> startGame(Principal principal) {
        // principal.getName() = logged-in username
        // Usually, you'll map username -> userId via UserRepository
        // (assuming you added a UserService or reused AuthService)
        // For simplicity, assume GameService handles username internally
        Long userId = gameService.getUserIdByUsername(principal.getName());
        Game game = gameService.startNewGame(userId);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/guess")
    public ResponseEntity<?> submitGuess(
            @PathVariable Long gameId,
            @RequestParam String guessWord,
            Principal principal) {
        try {
            Guess guess = gameService.submitGuess(gameId, guessWord.toUpperCase());
            Game game = gameService.getGameById(gameId);
            
            // Prepare response with game status and messages
            Map<String, Object> response = Map.of(
                "id", (Object) guess.getId(),
                "guessWord", (Object) guess.getGuessWord(),
                "guessNumber", (Object) guess.getGuessNumber(),
                "evaluation", (Object) guess.getEvaluation(),
                "createdAt", (Object) guess.getCreatedAt().toString(),
                "gameStatus", (Object) getGameStatus(game),
                "message", (Object) getGameMessage(game),
                "isGameOver", (Object) (game.getEndedAt() != null),
                "attemptsLeft", (Object) (5 - game.getAttempts())
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private String getGameStatus(Game game) {
        if (game.getEndedAt() == null) {
            return "IN_PROGRESS";
        } else if (game.isWon()) {
            return "WON";
        } else {
            return "LOST";
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

    @GetMapping("/test")
    public ResponseEntity<String> testAuth(Principal principal) {
        return ResponseEntity.ok("Authentication works! User: " + principal.getName());
    }
}
