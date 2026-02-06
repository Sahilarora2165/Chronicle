package com.project.blog_application.services;

import com.project.blog_application.DTO.CommentDTO;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.entities.Comment;
import com.project.blog_application.repository.CommentRepository;
import com.project.blog_application.repository.UserRepository;
import com.project.blog_application.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BlogPostRepository blogPostRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, UserRepository userRepository,
            BlogPostRepository blogPostRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.blogPostRepository = blogPostRepository;
    }

    // Create a comment
    public CommentDTO createComment(Long userId, Long blogPostId, String content) {
        Optional<User> user = userRepository.findById(userId);
        Optional<BlogPost> blogPost = blogPostRepository.findById(blogPostId);

        if (user.isPresent() && blogPost.isPresent()) {
            Comment comment = new Comment();
            comment.setContent(content);
            comment.setUser(user.get());
            comment.setBlogPost(blogPost.get());
            comment.setCreatedAt(LocalDateTime.now());
            return new CommentDTO(commentRepository.save(comment));
        }
        throw new RuntimeException("User or BlogPost not found for userId=" + userId + ", blogPostId=" + blogPostId);
    }

    // Get all comments
    public List<CommentDTO> getAllComments() {
        return commentRepository.findAll()
                .stream()
                .map(CommentDTO::new)
                .collect(Collectors.toList());
    }

    public List<Comment> getCommentsByBlogPost(Long blogPostId) {
        return commentRepository.findByBlogPostId(blogPostId);
    }

    // Get a comment by ID
    public Optional<CommentDTO> getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(CommentDTO::new);
    }

    // Update a comment
    public CommentDTO updateComment(Long id, String content) {
        Optional<Comment> existingComment = commentRepository.findById(id);
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            if (content != null && !content.isEmpty()) {
                comment.setContent(content);
            }
            comment.setCreatedAt(LocalDateTime.now()); // Update timestamp (since updatedAt is removed)
            return new CommentDTO(commentRepository.save(comment));
        }
        throw new RuntimeException("Comment not found for id=" + id);
    }

    // Delete a comment
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}