package com.project.blog_application.DTO;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.services.FileStorageService;

import java.io.Serializable;
import java.time.LocalDateTime;

public class BlogPostDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private Long userId;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean deleted;

    public BlogPostDTO() {
    }

    // Constructor to map BlogPost to BlogPostDTO
    public BlogPostDTO(BlogPost blogPost, FileStorageService fileStorageService) {
        this.id = blogPost.getId();
        this.title = blogPost.getTitle();
        this.content = blogPost.getContent();

        // ✅ CENTRALIZED image URL building
        this.imageUrl = fileStorageService.buildPublicUrl(blogPost.getImageUrl());

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
}