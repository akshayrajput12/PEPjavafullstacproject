package com.airesumeanalyzer.airesumeanalyzer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String analyzeResume(String resumeText, String jobDescription) {
        System.out.println("--- Starting Resume Analysis ---");
        System.out.println("API Key Present: " + (apiKey != null && !apiKey.isEmpty()));
        if (apiKey != null && apiKey.length() > 5) {
            System.out.println("API Key Preview: " + apiKey.substring(0, 5) + "...");
        }

        String prompt = "You are an AI Resume Analyzer. Analyze the following resume against the job description.\n\n" +
                "Resume Text:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Return the response in the following JSON format ONLY:\n" +
                "{\n" +
                " \"score\": <match_score_percentage_0_to_100>,\n" +
                " \"missing_skills\": [\"skill1\", \"skill2\"],\n" +
                " \"strengths\": [\"strength1\", \"strength2\"],\n" +
                " \"suggestions\": \"<improvement_suggestions>\"\n" +
                "}";

        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = apiUrl + "?key=" + apiKey;
            System.out.println("Gemini API URL: " + apiUrl); // Don't log the full URL with key
            System.out.println("Computed Prompt Length: " + prompt.length());
            
            try {
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                System.out.println("Request Payload: " + jsonBody);
            } catch (Exception e) {
                System.out.println("Failed to serialize request body: " + e.getMessage());
            }

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            System.out.println("Gemini API Response Status: " + response.getStatusCode());
            System.out.println("Gemini API Raw Response: " + response.getBody());


            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                // Clean up markdown code blocks if present
                if (responseText.startsWith("```json")) {
                    responseText = responseText.substring(7);
                }
                if (responseText.startsWith("```")) {
                    responseText = responseText.substring(3);
                }
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length() - 3);
                }
                return responseText.trim();
            } else {
                throw new RuntimeException("Gemini API request failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in GeminiService:");
            e.printStackTrace();
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }
}
