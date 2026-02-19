package com.airesumeanalyzer.airesumeanalyzer.service;

import com.airesumeanalyzer.airesumeanalyzer.dto.JobDTO;
import com.airesumeanalyzer.airesumeanalyzer.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final RestTemplate restTemplate;
    private final UserService userService;

    public JobService(UserService userService) {
        this.restTemplate = new RestTemplate();
        this.userService = userService;
    }

    public List<JobDTO> fetchJobs(String email) {
        String url = "https://remoteok.com/api";
        JobDTO[] jobsArray = restTemplate.getForObject(url, JobDTO[].class);

        if (jobsArray == null) {
            return Collections.emptyList();
        }

        List<JobDTO> jobs = new ArrayList<>(Arrays.asList(jobsArray));
        // Remove the first element which is usually legal text in RemoteOK API
        if (!jobs.isEmpty() && jobs.get(0).getSlug() == null) {
            jobs.remove(0);
        }

        User user = userService.getUserByEmail(email);
        List<String> userSkills = user.getSkills();

        if (userSkills != null && !userSkills.isEmpty()) {
            calculateMatchScores(jobs, userSkills);
            // Sort by match score descending
            jobs.sort((j1, j2) -> Integer.compare(j2.getMatchScore(), j1.getMatchScore()));
        }

        return jobs;
    }

    private void calculateMatchScores(List<JobDTO> jobs, List<String> userSkills) {
        for (JobDTO job : jobs) {
            int score = 0;
            List<String> jobTags = job.getTags();
            
            if (jobTags != null && !jobTags.isEmpty()) {
                long matches = userSkills.stream()
                        .map(String::toLowerCase)
                        .filter(skill -> jobTags.stream()
                                .map(String::toLowerCase)
                                .anyMatch(tag -> tag.contains(skill) || skill.contains(tag)))
                        .count();
                
                // Simple score calculation: (matches / userSkills.size) * 100
                // Or just based on tag overlap
                if (userSkills.size() > 0) {
                     score = (int) ((double) matches / userSkills.size() * 100);
                }
            }
            if (score > 100) score = 100;
            job.setMatchScore(score);
        }
    }
}
