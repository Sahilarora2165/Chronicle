package com.project.blog_application.DTO;

import com.project.blog_application.entities.BlogPost;

import java.io.Serializable;
import java.time.LocalDateTime;

public class BlogPostDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private Long userId; // Only user ID, not full user object
    private String username; // Including username for convenience
    private String email; // Including email for convenience
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean deleted;

    public BlogPostDTO() {
    }


    // Constructor to map BlogPost to BlogPostDTO
    public BlogPostDTO(BlogPost blogPost)  {
        this.id = blogPost.getId();
        this.title = blogPost.getTitle();
        this.content = blogPost.getContent();
        this.imageUrl = buildPublicImageUrl(blogPost.getImageUrl());
        this.userId = blogPost.getUser().getId();
        this.username = blogPost.getUser().getUsername();
        this.email = blogPost.getUser().getEmail();
        this.createdAt = blogPost.getCreatedAt();
        this.updatedAt = blogPost.getUpdatedAt();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    private String buildPublicImageUrl(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        // If already a full path, return as-is (backward compatibility)
        if (value.startsWith("/uploads/")) {
            return value;
        }

        return "/uploads/" + value;
    }


}
