package com.wordgame.repository;


import com.wordgame.entity.Game;
import com.wordgame.entity.Guess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface GuessRepository extends JpaRepository<Guess, Long> {
    List<Guess> findByGame(Game game);
    List<Guess> findByGameIdOrderByGuessNumberAsc(Long gameId);
}