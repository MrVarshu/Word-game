package com.wordgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class GuessRequest {
    @NotBlank
    @Size(min = 5, max = 5)
    @Pattern(regexp = "^[A-Z]{5}$", message = "Guess must be 5 uppercase letters")
    private String guess;
    
    // Constructors
    public GuessRequest() {}
    
    public GuessRequest(String guess) {
        this.guess = guess;
    }
    
    // Getter and Setter
    public String getGuess() {
        return guess;
    }
    
    public void setGuess(String guess) {
        this.guess = guess;
    }
}