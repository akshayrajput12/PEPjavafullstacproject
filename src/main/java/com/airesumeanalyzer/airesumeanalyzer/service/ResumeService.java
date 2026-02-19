package com.airesumeanalyzer.airesumeanalyzer.service;

import com.airesumeanalyzer.airesumeanalyzer.model.Resume;
import com.airesumeanalyzer.airesumeanalyzer.model.User;
import com.airesumeanalyzer.airesumeanalyzer.repository.ResumeRepository;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final Path fileStorageLocation;
    private final Tika tika;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
        this.tika = new Tika();
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Resume storeResume(MultipartFile file, User user) throws IOException {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

        if (fileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
        }

        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String extractedText = parseResumeText(targetLocation);

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName(originalFileName);
        resume.setExtractedText(extractedText);

        return resumeRepository.save(resume);
    }

    private String parseResumeText(Path filePath) throws IOException {
        try (InputStream stream = Files.newInputStream(filePath)) {
            return tika.parseToString(stream);
        } catch (Exception e) {
            throw new IOException("Failed to parse resume text", e);
        }
    }

    public List<Resume> getResumesByUser(User user) {
        return resumeRepository.findByUserId(user.getId());
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id " + id));
    }

    public void deleteResume(Long id) {
        resumeRepository.deleteById(id);
    }
}
