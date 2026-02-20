package com.airesumeanalyzer.airesumeanalyzer.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String headline;
    private String currentJobTitle;

    @Column(length = 1000)
    private String about;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> skills;

    private String location;
    private String website;
    private String profilePictureUrl;
    private String resumeUrl;

    public User() {
    }

    public User(Long id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getCurrentJobTitle() { return currentJobTitle; }
    public void setCurrentJobTitle(String currentJobTitle) { this.currentJobTitle = currentJobTitle; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
}
