package com.project.blog_application.DTO;

import com.project.blog_application.entities.BlogPost;

import java.time.LocalDateTime;

public class BlogPostListDTO {
    private Long id;
    private String title;
    private String excerpt;
    private String imageUrl;
    private String username;
    private LocalDateTime createdAt;

    public BlogPostListDTO(BlogPost post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.excerpt =
                post.getContent().length() > 150
                        ? post.getContent().substring(0, 150) + "..."
                        : post.getContent();
        this.imageUrl = buildPublicImageUrl(post.getImageUrl());
        this.username = post.getUser().getUsername();
        this.createdAt = post.getCreatedAt();
    }

    private String buildPublicImageUrl(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        if (value.startsWith("/uploads/")) {
            return value;
        }

        return "/uploads/" + value;
    }

    // ✅ ADD THESE GETTERS
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