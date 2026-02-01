package com.project.blog_application.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import com.project.blog_application.entities.Comment;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Find comments by blog post id
    List<Comment> findByBlogPostId(Long blogPostId);

    // Find comments by user id
    List<Comment> findByUserId(Long userId);

    // Find comments by blog post id and user id
    List<Comment> findByBlogPostIdAndUserId(Long blogPostId, Long userId);

    @Query("SELECT c FROM Comment c JOIN FETCH c.blogPost JOIN FETCH c.user")
    @NonNull
    List<Comment> findAll();

    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.blogPost ORDER BY c.createdAt DESC")
    List<Comment> findTop10ByOrderByCreatedAtDesc();
    // Count comments by user ID - Performance optimization to avoid N+1 query problem
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
}
