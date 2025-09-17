package com.wordgame.service;

import com.wordgame.entity.Role;
import com.wordgame.entity.User;
import com.wordgame.repository.UserRepository;
import com.wordgame.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    public JwtUtil getJwtUtil() {
        return jwtUtil;
    }

    public void register(String username, String password, Role role) {
        if (username == null || username.length() < 5) {
            throw new RuntimeException("Username must be at least 5 characters long");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }

    public User login(String username, String password) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(username, password)
    );
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    user.setPasswordHash(null); // Don't expose hash
    return user;
    }
}
