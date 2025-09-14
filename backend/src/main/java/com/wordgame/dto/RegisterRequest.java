package com.wordgame.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public class RegisterRequest {


@NotBlank
@Size(min = 5, max = 50)
@Pattern(regexp = "^(?=.*[A-Za-z])[A-Za-z]{5,}$", message = "Username must have at least 5 letters, only letters allowed for username here")
private String username;


@NotBlank
@Size(min = 5)
@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$%*@]).{5,}$", message = "Password must contain letters, digits and one of $%*@")
private String password;


public String getUsername() {
    return username;
}

public void setUsername(String username) {
    this.username = username;
}

public String getPassword() {
    return password;
}

public void setPassword(String password) {
    this.password = password;
}

}