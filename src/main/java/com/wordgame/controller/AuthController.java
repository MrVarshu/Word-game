package com.wordgame.controller;

import com.wordgame.dto.AuthResponse;
import com.wordgame.dto.RegisterRequest;
import com.wordgame.entity.Role;
import com.wordgame.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request.getUsername(), request.getPassword(), Role.PLAYER);
            return ResponseEntity.ok().body(Map.of("message", "User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody RegisterRequest request) {
    var user = authService.login(request.getUsername(), request.getPassword());
    String token = authService.getJwtUtil().generateToken(user.getUsername());
    return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
    }
}
