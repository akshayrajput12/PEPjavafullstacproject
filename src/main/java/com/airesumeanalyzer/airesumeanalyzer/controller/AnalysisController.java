package com.airesumeanalyzer.airesumeanalyzer.controller;

import com.airesumeanalyzer.airesumeanalyzer.dto.AnalysisRequest;
import com.airesumeanalyzer.airesumeanalyzer.model.Analysis;
import com.airesumeanalyzer.airesumeanalyzer.model.Resume;
import com.airesumeanalyzer.airesumeanalyzer.repository.AnalysisRepository;
import com.airesumeanalyzer.airesumeanalyzer.service.GeminiService;
import com.airesumeanalyzer.airesumeanalyzer.service.ResumeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyze")
public class AnalysisController {

    private final AnalysisRepository analysisRepository;
    private final ResumeService resumeService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AnalysisController(AnalysisRepository analysisRepository, ResumeService resumeService, GeminiService geminiService) {
        this.analysisRepository = analysisRepository;
        this.resumeService = resumeService;
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/{resumeId}")
    public ResponseEntity<Analysis> analyzeResume(@PathVariable Long resumeId, @RequestBody AnalysisRequest request) {
        try {
            Resume resume = resumeService.getResumeById(resumeId);
            String analysisResultJson = geminiService.analyzeResume(resume.getExtractedText(), request.getJobDescription());

            Analysis analysis = new Analysis();
            analysis.setResume(resume);
            analysis.setJobDescription(request.getJobDescription());
            analysis.setResult(analysisResultJson);

            // Extract score from JSON
            JsonNode root = objectMapper.readTree(analysisResultJson);
            if (root.has("score")) {
                analysis.setScore(root.get("score").asDouble());
            }

            return ResponseEntity.ok(analysisRepository.save(analysis));
        } catch (Exception e) {
            System.err.println("ERROR in AnalysisController.analyzeResume:");
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history/{resumeId}")
    public ResponseEntity<List<Analysis>> getAnalysisHistory(@PathVariable Long resumeId) {
        return ResponseEntity.ok(analysisRepository.findByResumeId(resumeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long id) {
        analysisRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
