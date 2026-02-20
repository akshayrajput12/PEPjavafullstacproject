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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> analyzeResume(@PathVariable Long resumeId, @RequestBody AnalysisRequest request) {
        try {
            System.out.println("=== AnalysisController.analyzeResume called for resumeId=" + resumeId + " ===");

            Resume resume = resumeService.getResumeById(resumeId);
            System.out.println("Resume found: " + resume.getFileName());
            System.out.println("Extracted text length: " + (resume.getExtractedText() != null ? resume.getExtractedText().length() : 0));

            if (resume.getExtractedText() == null || resume.getExtractedText().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Resume text is empty. The file may not have been parsed correctly. Please re-upload your resume.");
                return ResponseEntity.badRequest().body(error);
            }

            String analysisResultJson = geminiService.analyzeResume(resume.getExtractedText(), request.getJobDescription());
            System.out.println("Gemini analysis complete. Result: " + analysisResultJson);

            Analysis analysis = new Analysis();
            analysis.setResume(resume);
            analysis.setJobDescription(request.getJobDescription());
            analysis.setResult(analysisResultJson);

            // Extract score from JSON
            try {
                JsonNode root = objectMapper.readTree(analysisResultJson);
                if (root.has("score")) {
                    analysis.setScore(root.get("score").asDouble());
                }
            } catch (Exception jsonEx) {
                System.err.println("Could not parse score from analysis JSON: " + jsonEx.getMessage());
                // Continue with score=0 rather than failing completely
                analysis.setScore(0.0);
            }

            Analysis saved = analysisRepository.save(analysis);
            System.out.println("Analysis saved with id=" + saved.getId());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            System.err.println("ERROR in AnalysisController.analyzeResume:");
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error during analysis");
            return ResponseEntity.internalServerError().body(error);
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
