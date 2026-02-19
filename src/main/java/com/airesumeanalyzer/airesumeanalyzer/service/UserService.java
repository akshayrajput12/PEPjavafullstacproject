package com.airesumeanalyzer.airesumeanalyzer.service;

import com.airesumeanalyzer.airesumeanalyzer.dto.UserProfileDTO;
import com.airesumeanalyzer.airesumeanalyzer.model.User;
import com.airesumeanalyzer.airesumeanalyzer.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User updateUserProfile(String email, UserProfileDTO dto) {
        User user = getUserByEmail(email);

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getHeadline() != null) user.setHeadline(dto.getHeadline());
        if (dto.getCurrentJobTitle() != null) user.setCurrentJobTitle(dto.getCurrentJobTitle());
        if (dto.getAbout() != null) user.setAbout(dto.getAbout());
        if (dto.getSkills() != null) user.setSkills(dto.getSkills());
        if (dto.getLocation() != null) user.setLocation(dto.getLocation());
        if (dto.getWebsite() != null) user.setWebsite(dto.getWebsite());
        if (dto.getProfilePictureUrl() != null) user.setProfilePictureUrl(dto.getProfilePictureUrl());
        
        // Email usually shouldn't be updated here without re-verification, so skipping for now

        return userRepository.save(user);
    }

    @Transactional
    public void updateResumeUrl(String email, String resumeUrl) {
        User user = getUserByEmail(email);
        user.setResumeUrl(resumeUrl);
        userRepository.save(user);
    }
}
