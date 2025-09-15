package com.wordgame.dto;

import java.util.List;

public class GuessResponse {
    private int guessNumber;
    private String guessWord;
    private List<EvaluatedLetter> evaluation;
    
    // Constructors
    public GuessResponse() {}
    
    public GuessResponse(int guessNumber, String guessWord, List<EvaluatedLetter> evaluation) {
        this.guessNumber = guessNumber;
        this.guessWord = guessWord;
        this.evaluation = evaluation;
    }
    
    // Getters and Setters
    public int getGuessNumber() {
        return guessNumber;
    }
    
    public void setGuessNumber(int guessNumber) {
        this.guessNumber = guessNumber;
    }
    
    public String getGuessWord() {
        return guessWord;
    }
    
    public void setGuessWord(String guessWord) {
        this.guessWord = guessWord;
    }
    
    public List<EvaluatedLetter> getEvaluation() {
        return evaluation;
    }
    
    public void setEvaluation(List<EvaluatedLetter> evaluation) {
        this.evaluation = evaluation;
    }
}
