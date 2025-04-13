package com.code.api.controller;

import com.code.api.entity.User;
import com.code.api.services.IUserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private IUserService userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
    	System.out.println(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userService.save(user);
    }
    @GetMapping("/users")
    public List<User> getAllUsers(){
    	return userService.findAll();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existingUser = userService.findByUsername(user.getUsername());

        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            String token = UUID.randomUUID().toString(); // or your token logic

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", existingUser); // will be serialized as JSON

            return ResponseEntity.ok(response);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid username or password");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }


}
