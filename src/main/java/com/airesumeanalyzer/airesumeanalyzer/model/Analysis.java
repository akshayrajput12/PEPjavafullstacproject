package com.airesumeanalyzer.airesumeanalyzer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnoreProperties({"user", "extractedText", "hibernateLazyInitializer", "handler"})
    private Resume resume;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String jobDescription;

    private Double score;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String result;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Analysis() {}

    public Analysis(Long id, Resume resume, String jobDescription, Double score, String result, LocalDateTime createdAt) {
        this.id = id;
        this.resume = resume;
        this.jobDescription = jobDescription;
        this.score = score;
        this.result = result;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
