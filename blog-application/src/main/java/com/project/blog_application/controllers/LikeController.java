package com.project.blog_application.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.blog_application.services.FileStorageService;
import com.project.blog_application.DTO.BlogPostDTO;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.services.LikeService;

@RestController
@RequestMapping("api/likes")
public class LikeController {
    private final LikeService likeService;
    private final FileStorageService fileStorageService;

    @Autowired
    public LikeController(LikeService likeService, FileStorageService fileStorageService) {
        this.likeService = likeService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/test")
    public String test() {
        return "Hello from LikeController";
    }

    @PostMapping("/toggle")
    public ResponseEntity<String> toggleLike(@RequestParam Long userId, @RequestParam Long blogPostId) {
        String result = likeService.toggleLike(userId, blogPostId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/count/{blogPostId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long blogPostId) {
        Long count = likeService.getLikeCount(blogPostId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> hasUserLiked(@RequestParam Long userId, @RequestParam Long blogPostId) {
        boolean hasLiked = likeService.hasUserLiked(userId, blogPostId);
        return ResponseEntity.ok(hasLiked);
    }

    @GetMapping("/user/{userId}/liked-posts")
    public ResponseEntity<List<BlogPostDTO>> getLikedPosts(@PathVariable Long userId) {
        List<BlogPost> likedPosts = likeService.getLikedBlogPosts(userId);

        // Convert List<BlogPost> to List<BlogPostDTO>
        List<BlogPostDTO> likedPostDTOs = likedPosts.stream()
                .map(post -> new BlogPostDTO(post, fileStorageService))
                .collect(Collectors.toList());


        return ResponseEntity.ok(likedPostDTOs);
    }

}
