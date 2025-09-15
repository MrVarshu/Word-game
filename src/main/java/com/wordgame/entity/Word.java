package com.wordgame.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "words")
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 5)
    private String word;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ---------- Constructors ----------
    public Word() {
    }

    public Word(Long id, String word, LocalDateTime createdAt) {
        this.id = id;
        this.word = word;
        this.createdAt = createdAt;
    }

    // ---------- Getters ----------
    public Long getId() {
        return id;
    }

    public String getWord() {
        return word;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ---------- Setters ----------
    public void setId(Long id) {
        this.id = id;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
