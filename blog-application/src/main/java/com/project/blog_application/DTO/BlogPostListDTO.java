package com.project.blog_application.DTO;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.services.FileStorageService;

import java.time.LocalDateTime;

public class BlogPostListDTO {

    private Long id;
    private String title;
    private String excerpt;
    private String imageUrl;
    private String username;
    private LocalDateTime createdAt;

    public BlogPostListDTO(){
    }

    public BlogPostListDTO(BlogPost blogPost, FileStorageService fileStorageService) {
        this.id = blogPost.getId();
        this.title = blogPost.getTitle();

        this.excerpt = blogPost.getContent().length() > 150
                ? blogPost.getContent().substring(0, 150) + "..."
                : blogPost.getContent();

        // ✅ CENTRALIZED image URL building
        this.imageUrl = fileStorageService.buildPublicUrl(blogPost.getImageUrl());

        this.username = blogPost.getUser().getUsername();
        this.createdAt = blogPost.getCreatedAt();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getUsername() {
        return username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}