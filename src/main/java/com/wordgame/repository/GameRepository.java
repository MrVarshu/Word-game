package com.wordgame.repository;


import com.wordgame.entity.Game;
import com.wordgame.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;


public interface GameRepository extends JpaRepository<Game, Long> {

    // Gameplay
    List<Game> findByUser(User user);
    List<Game> findByUserAndStartedAtBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Game> findByUserIdOrderByStartedAtDesc(Long userId);

    // Reporting
    long countByUserIdAndStartedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
    long countByWonTrueAndStartedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("select count(distinct g.user.id) from Game g where g.startedAt between :start and :end")
    long countDistinctUsersByStartedAtBetween(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);
}

