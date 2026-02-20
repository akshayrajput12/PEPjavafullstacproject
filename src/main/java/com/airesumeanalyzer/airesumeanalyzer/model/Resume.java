package com.airesumeanalyzer.airesumeanalyzer.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "resumes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String fileName;

    @JsonIgnore
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String extractedText;

    public Resume() {}

    public Resume(Long id, User user, String fileName, String extractedText) {
        this.id = id;
        this.user = user;
        this.fileName = fileName;
        this.extractedText = extractedText;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
}
