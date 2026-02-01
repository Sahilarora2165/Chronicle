package com.project.blog_application.DTO;

import java.io.Serializable;
import java.time.LocalDateTime;

public class RecentActivityDTO implements Serializable {

    private static final long serialVersionUID = 1L;
    private String type;
    private String description;
    private LocalDateTime timestamp;

    public RecentActivityDTO(String type, String description, LocalDateTime timestamp) {
        this.type = type;
        this.description = description;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}