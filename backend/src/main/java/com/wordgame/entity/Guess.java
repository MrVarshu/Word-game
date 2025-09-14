package com.wordgame.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guesses")
public class Guess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "guess_word", nullable = false, length = 5)
    private String guessWord;

    @Column(name = "guess_number", nullable = false)
    private int guessNumber;

    @Column(columnDefinition = "JSON", nullable = false)
    private String evaluation;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ---------- Constructors ----------
    public Guess() {
    }

    public Guess(Long id, Game game, String guessWord, int guessNumber,
                 String evaluation, LocalDateTime createdAt) {
        this.id = id;
        this.game = game;
        this.guessWord = guessWord;
        this.guessNumber = guessNumber;
        this.evaluation = evaluation;
        this.createdAt = createdAt;
    }

    // ---------- Getters ----------
    public Long getId() {
        return id;
    }

    public Game getGame() {
        return game;
    }

    public String getGuessWord() {
        return guessWord;
    }

    public int getGuessNumber() {
        return guessNumber;
    }

    public String getEvaluation() {
        return evaluation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ---------- Setters ----------
    public void setId(Long id) {
        this.id = id;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public void setGuessWord(String guessWord) {
        this.guessWord = guessWord;
    }

    public void setGuessNumber(int guessNumber) {
        this.guessNumber = guessNumber;
    }

    public void setEvaluation(String evaluation) {
        this.evaluation = evaluation;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
