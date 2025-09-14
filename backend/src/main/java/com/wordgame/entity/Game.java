package com.wordgame.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime endedAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private boolean won = false;

    // ---------- Constructors ----------
    public Game() {
    }

    public Game(Long id, User user, Word word, LocalDateTime startedAt,
                LocalDateTime endedAt, int attempts, boolean won) {
        this.id = id;
        this.user = user;
        this.word = word;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.attempts = attempts;
        this.won = won;
    }

    // ---------- Getters ----------
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Word getWord() {
        return word;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public boolean isWon() {
        return won;
    }

    // ---------- Setters ----------
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setWord(Word word) {
        this.word = word;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public void setWon(boolean won) {
        this.won = won;
    }
}
