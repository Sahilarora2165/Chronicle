package com.project.blog_application.DTO;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.project.blog_application.entities.Comment;

public class CommentDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String content;
    private Long userId;
    private String username;
    private Long blogPostId;
    private String blogPostTitle;
    private LocalDateTime createdAt;

    // Default constructor
    public CommentDTO() {
    }

    // Constructor to map from Comment entity
    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.userId = comment.getUser().getId();
        this.username = comment.getUser().getUsername();
        this.blogPostId = comment.getBlogPost().getId();
        this.blogPostTitle = comment.getBlogPost().getTitle();
        this.createdAt = comment.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public Long getBlogPostId() {
        return blogPostId;
    }

    public void setBlogPostId(Long blogPostId) {
        this.blogPostId = blogPostId;
    }

    public String getBlogPostTitle() {
        return blogPostTitle;
    }

    public void setBlogPostTitle(String blogPostTitle) {
        this.blogPostTitle = blogPostTitle;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}