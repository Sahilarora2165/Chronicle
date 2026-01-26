package com.project.blog_application.controllers;

import com.project.blog_application.DTO.CommentDTO;
import com.project.blog_application.metrics.BlogMetrics;
import com.project.blog_application.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;
    private final BlogMetrics blogMetrics;

    public CommentController(CommentService commentService,BlogMetrics blogMetrics){
        this.commentService = commentService;
        this.blogMetrics = blogMetrics;
    }

    // Create a comment
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @RequestParam Long userId,
            @RequestParam Long blogPostId,
            @RequestBody String content) {
        try {
            blogMetrics.incrementCommentCreated();
            CommentDTO comment = commentService.createComment(userId, blogPostId, content);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get all comments
    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        List<CommentDTO> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    // Get all comments for a blog post
    @GetMapping("/blog/{blogPostId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByBlogPost(@PathVariable Long blogPostId) {
        List<CommentDTO> comments = commentService.getCommentsByBlogPost(blogPostId).stream()
                .map(CommentDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(comments);
    }

    // Get a comment by ID
    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        return commentService.getCommentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id, @RequestBody String content) {
        try {
            CommentDTO updatedComment = commentService.updateComment(id, content);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}