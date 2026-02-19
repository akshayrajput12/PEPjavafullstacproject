package com.airesumeanalyzer.airesumeanalyzer.controller;

import com.airesumeanalyzer.airesumeanalyzer.dto.UserProfileDTO;
import com.airesumeanalyzer.airesumeanalyzer.model.User;
import com.airesumeanalyzer.airesumeanalyzer.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*") // Adjust origin as needed
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(@RequestBody UserProfileDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User updatedUser = userService.updateUserProfile(email, dto);
        return ResponseEntity.ok(updatedUser);
    }
}
