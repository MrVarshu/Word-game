package com.wordgame.dto;

public class StartGameResponse {
    private Long gameId;
    private int attemptsLeft;
    
    // Constructors
    public StartGameResponse() {}
    
    public StartGameResponse(Long gameId, int attemptsLeft) { 
        this.gameId = gameId; 
        this.attemptsLeft = attemptsLeft; 
    }
    
    // Getters and Setters
    public Long getGameId() {
        return gameId;
    }
    
    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }
    
    public int getAttemptsLeft() {
        return attemptsLeft;
    }
    
    public void setAttemptsLeft(int attemptsLeft) {
        this.attemptsLeft = attemptsLeft;
    }
}
