package com.project.blog_application.DTO;

import com.project.blog_application.entities.Role;
import com.project.blog_application.entities.User;
import com.project.blog_application.services.FileStorageService;

import java.io.Serializable;
import java.time.LocalDateTime;

public class UserDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private String bio;
    private String profilePicture;

    public UserDTO(User user, FileStorageService fileStorageService) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.bio = user.getBio();

        // CENTRALIZED image URL handling
        this.profilePicture =
                fileStorageService.buildPublicUrl(user.getProfilePicture());
    }
    

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

}