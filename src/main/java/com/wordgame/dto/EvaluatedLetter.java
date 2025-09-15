package com.wordgame.dto;

public class EvaluatedLetter {
    private char letter;
    private String state; // GREEN | ORANGE | GREY

    // Constructors
    public EvaluatedLetter() {}
    
    public EvaluatedLetter(char letter, String state) { 
        this.letter = letter; 
        this.state = state; 
    }
    
    // Getters and Setters
    public char getLetter() {
        return letter;
    }
    
    public void setLetter(char letter) {
        this.letter = letter;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
}
