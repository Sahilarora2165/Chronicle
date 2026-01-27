package com.project.blog_application.entities;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Entity
@Table(name = "likes", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "blog_post_id"})
    },
    indexes = {
        @Index(name = "idx_like_user_id", columnList = "user_id"),
        @Index(name = "idx_like_blog_post_id", columnList = "blog_post_id"),
        @Index(name = "idx_like_created_at", columnList = "created_at")
    }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Like implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_post_id", nullable = false)
    private BlogPost blogPost;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public int hashCode() {
        return Objects.hash(id); // Use only ID
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Like like = (Like) o;
        return Objects.equals(id, like.id);
    }
}