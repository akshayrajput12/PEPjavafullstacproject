package com.airesumeanalyzer.airesumeanalyzer.dto;

import java.util.List;

public class JobDTO {
    private String slug;
    private String id;
    private String epoch;
    private String date;
    private String company;
    private String company_logo;
    private String position;
    private List<String> tags;
    private String logo;
    private String description;
    private String location;
    private String url;
    private String apply_url;
    private int matchScore; // Custom field for our app

    // Getters and Setters
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEpoch() { return epoch; }
    public void setEpoch(String epoch) { this.epoch = epoch; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getCompany_logo() { return company_logo; }
    public void setCompany_logo(String company_logo) { this.company_logo = company_logo; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getApply_url() { return apply_url; }
    public void setApply_url(String apply_url) { this.apply_url = apply_url; }
    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }
}
