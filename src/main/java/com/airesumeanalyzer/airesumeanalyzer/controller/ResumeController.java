package com.airesumeanalyzer.airesumeanalyzer.controller;

import com.airesumeanalyzer.airesumeanalyzer.model.Resume;
import com.airesumeanalyzer.airesumeanalyzer.model.User;
import com.airesumeanalyzer.airesumeanalyzer.service.ResumeService;
import com.airesumeanalyzer.airesumeanalyzer.service.StorageService;
import com.airesumeanalyzer.airesumeanalyzer.service.UserService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {


    private final ResumeService resumeService;
    private final UserService userService;
    private final StorageService storageService; // Keeping for file serving if needed

    public ResumeController(ResumeService resumeService, UserService userService, StorageService storageService) {
        this.resumeService = resumeService;
        this.userService = userService;
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            Resume resume = resumeService.storeResume(file, user);
            
            // Also update the profile resume URL for easy access if desired
             String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/resume/uploads/")
                .path(resume.getFileName()) // Assuming filename is unique enough or store logic handles it
                .toUriString();
            userService.updateResumeUrl(email, fileDownloadUri);

            return ResponseEntity.ok(resume);
        } catch (Exception e) {
             return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-resumes")
    public ResponseEntity<List<Resume>> getMyResumes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<Resume> resumes = resumeService.getResumesByUser(user);
        return ResponseEntity.ok(resumes);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/uploads/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {

        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }
}
