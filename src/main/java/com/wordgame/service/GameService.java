package com.wordgame.service;

import com.wordgame.entity.*;
import com.wordgame.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GuessRepository guessRepository;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;

    @Transactional
    public Game startNewGame(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long gamesToday = gameRepository
                .countByUserIdAndStartedAtBetween(userId, startOfDay, endOfDay);

        if (gamesToday >= 3) {
            throw new RuntimeException("Daily limit (3 games) reached");
        }

        Word word = wordRepository.findRandomWord();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Game game = new Game();
        game.setUser(user);
        game.setWord(word);
        game.setStartedAt(now);
        game.setAttempts(0);
        game.setWon(false);

        return gameRepository.save(game);
    }

    @Transactional
    public Guess submitGuess(Long gameId, String guessWord) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getEndedAt() != null || game.isWon()) {
            throw new RuntimeException("Game already ended");
        }
        if (game.getAttempts() >= 5) {
            throw new RuntimeException("Maximum guesses reached");
        }

        String target = game.getWord().getWord();
        String evaluation = evaluateGuess(guessWord, target);

        Guess guess = new Guess();
        guess.setGame(game);
        guess.setGuessWord(guessWord);
        guess.setGuessNumber(game.getAttempts() + 1);
        guess.setEvaluation(evaluation);
        guessRepository.save(guess);

        game.setAttempts(game.getAttempts() + 1);
        if (guessWord.equals(target)) {
            game.setWon(true);
            game.setEndedAt(LocalDateTime.now());
        } else if (game.getAttempts() >= 5) {
            game.setEndedAt(LocalDateTime.now());
        }

        gameRepository.save(game);
        return guess;
    }

    private String evaluateGuess(String guess, String target) {
        // Build JSON like: [{"letter":"A","color":"GREEN"},...]
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < guess.length(); i++) {
            char c = guess.charAt(i);
            String color;
            if (c == target.charAt(i)) {
                color = "GREEN";
            } else if (target.indexOf(c) >= 0) {
                color = "ORANGE";
            } else {
                color = "GREY";
            }
            sb.append("{\"letter\":\"")
              .append(c)
              .append("\",\"color\":\"")
              .append(color)
              .append("\"}");
            if (i < guess.length() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public List<Guess> getGuesses(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return guessRepository.findByGame(game);
    }

    public Game getGameById(Long gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
    }

    public List<Game> getGameHistory(Long userId) {
        return gameRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
