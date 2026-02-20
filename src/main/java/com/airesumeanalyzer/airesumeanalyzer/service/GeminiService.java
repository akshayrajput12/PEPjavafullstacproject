package com.airesumeanalyzer.airesumeanalyzer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
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
        System.out.println("API URL: " + apiUrl);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new RuntimeException("Gemini API key is not configured. Please set gemini.api.key in application.properties.");
        }

        if (resumeText == null || resumeText.trim().isEmpty()) {
            throw new RuntimeException("Resume text is empty. Make sure the resume was parsed correctly during upload.");
        }

        String prompt = "You are an expert AI Resume Analyzer. Carefully analyze the following resume against the job description.\n\n" +
                "Resume Text:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Respond ONLY with a valid JSON object in the following exact format. Do not include any text before or after the JSON:\n" +
                "{\n" +
                "  \"score\": <integer_0_to_100>,\n" +
                "  \"missing_skills\": [\"skill1\", \"skill2\"],\n" +
                "  \"strengths\": [\"strength1\", \"strength2\"],\n" +
                "  \"suggestions\": \"<specific improvement suggestions>\"\n" +
                "}";

        try {
            // Build Gemini API request body
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            // Add generation config for better JSON output
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.4);
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            generationConfig.put("maxOutputTokens", 8192);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = apiUrl + "?key=" + apiKey;
            System.out.println("Calling Gemini API at: " + apiUrl);
            System.out.println("Prompt length: " + prompt.length() + " chars");

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            System.out.println("Gemini API Response Status: " + response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK) {
                String body = response.getBody();
                System.out.println("Raw Gemini Response: " + body);

                JsonNode root = objectMapper.readTree(body);

                // Check for errors in the response
                if (root.has("error")) {
                    String errorMsg = root.path("error").path("message").asText("Unknown error");
                    int errorCode = root.path("error").path("code").asInt(0);
                    throw new RuntimeException("Gemini API returned an error (code " + errorCode + "): " + errorMsg);
                }

                // Extract text from response
                JsonNode candidates = root.path("candidates");
                if (candidates.isMissingNode() || candidates.size() == 0) {
                    throw new RuntimeException("Gemini API returned no candidates in response. Check prompt safety filters.");
                }

                String responseText = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

                System.out.println("Extracted text from Gemini: " + responseText);

                // Clean up markdown code blocks if present
                responseText = responseText.trim();
                if (responseText.startsWith("```json")) {
                    responseText = responseText.substring(7);
                } else if (responseText.startsWith("```")) {
                    responseText = responseText.substring(3);
                }
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length() - 3);
                }
                responseText = responseText.trim();

                // Validate it's proper JSON
                try {
                    objectMapper.readTree(responseText);
                } catch (Exception jsonEx) {
                    System.err.println("Gemini returned non-JSON text: " + responseText);
                    throw new RuntimeException("Gemini response is not valid JSON: " + responseText.substring(0, Math.min(200, responseText.length())));
                }

                return responseText;
            } else {
                throw new RuntimeException("Gemini API request failed with HTTP status: " + response.getStatusCode() + " - Body: " + response.getBody());
            }

        } catch (HttpClientErrorException e) {
            System.err.println("Gemini API HTTP Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new RuntimeException("Gemini API key is invalid or unauthorized. Please check your API key at aistudio.google.com. Error: " + e.getMessage(), e);
            } else if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("Gemini model not found. The model name in the URL may be incorrect. Error: " + e.getMessage(), e);
            } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new RuntimeException("Gemini API rate limit exceeded. Please try again in a few seconds. Error: " + e.getMessage(), e);
            }
            throw new RuntimeException("Gemini API client error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (HttpServerErrorException e) {
            System.err.println("Gemini API HTTP Server Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API server error (" + e.getStatusCode() + "): " + e.getMessage(), e);
        } catch (RuntimeException e) {
            System.err.println("CRITICAL ERROR in GeminiService: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in GeminiService: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }
}
