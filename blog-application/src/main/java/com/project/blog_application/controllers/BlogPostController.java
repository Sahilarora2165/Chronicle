package com.project.blog_application.controllers;

import java.io.IOException;
import java.util.Optional;

import com.project.blog_application.DTO.PageResponse;
import com.project.blog_application.metrics.BlogMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.project.blog_application.services.FileStorageService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.blog_application.DTO.BlogPostDTO;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.exceptions.ResourceNotFoundException;
import com.project.blog_application.repository.UserRepository;
import com.project.blog_application.services.BlogPostService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/posts")
public class BlogPostController {

    private static final Logger logger = LoggerFactory.getLogger(BlogPostController.class);

    private final BlogPostService blogPostService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final BlogMetrics blogMetrics;

    @Autowired
    public BlogPostController(
            BlogPostService blogPostService,
            UserRepository userRepository,
            FileStorageService fileStorageService,
            BlogMetrics blogMetrics
    ) {
        this.blogPostService = blogPostService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.blogMetrics = blogMetrics;
    }

    // ✅ Returns cached JSON string directly
    @GetMapping
    public ResponseEntity<String> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            logger.info("📄 GET /api/posts - page: {}, size: {}", page, size);

            String json = blogPostService.getAllBlogPostsJson(
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            );

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(json);
        } catch (Exception e) {
            logger.error("❌ Error fetching posts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"Failed to fetch posts\"}");
        }
    }

    // ✅ Returns deserialized DTO from cached JSON
    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDTO> getPostById(@PathVariable Long id) {
        try {
            logger.info("📄 GET /api/posts/{} - fetching post", id);

            BlogPostDTO response = blogPostService.getBlogPostDTOById(id);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.warn("⚠️ Post {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            logger.error("❌ Error fetching post {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping(consumes = "multipart/form-data", produces = "application/json")
    public ResponseEntity<BlogPostDTO> createPost(
            @RequestPart("blogPost") String blogPostJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            Optional<User> user = fetchAuthenticatedUser(userDetails);
            if (!user.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            BlogPost blogPost = convertJsonToBlogPost(blogPostJson);
            blogPost.setUser(user.get());

            if (file != null && !file.isEmpty()) {
                String filename = fileStorageService.store(file);
                blogPost.setImageUrl(filename);
            }

            // This clears caches automatically
            BlogPost savedPost = blogPostService.createPost(blogPost, user.get());

            logger.info("✅ Blog post created, incrementing metric");
            blogMetrics.incrementPostCreated();

            BlogPostDTO response = new BlogPostDTO(savedPost, fileStorageService);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            logger.error("❌ IOException occurred while creating the post", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private Optional<User> fetchAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername());
    }

    private BlogPost convertJsonToBlogPost(String blogPostJson) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readValue(blogPostJson, BlogPost.class);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<BlogPostDTO> updatePost(
            @PathVariable Long id,
            @RequestPart(value = "blogPost", required = false) String blogPostJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            // 1️⃣ Ensure post exists
            blogPostService.getBlogPostById(id);

            // 2️⃣ Create PATCH object (DO NOT reuse existing entity)
            BlogPost patch = new BlogPost();

            // 3️⃣ Handle partial JSON update
            if (blogPostJson != null && !blogPostJson.isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                BlogPost incoming = objectMapper.readValue(blogPostJson, BlogPost.class);

                if (incoming.getTitle() != null && !incoming.getTitle().isEmpty()) {
                    patch.setTitle(incoming.getTitle());
                }
                if (incoming.getContent() != null && !incoming.getContent().isEmpty()) {
                    patch.setContent(incoming.getContent());
                }
            }

            // 4️⃣ Handle optional image update
            if (file != null && !file.isEmpty()) {
                String filename = fileStorageService.store(file);
                patch.setImageUrl(filename); // filename ONLY
            }

            // 5️⃣ Delegate update logic to service
            BlogPost savedPost = blogPostService.updatePost(id, patch);

            return ResponseEntity.ok(
                    new BlogPostDTO(savedPost, fileStorageService)
            );


        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            logger.error("❌ Error updating post {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id) {
        try {
            // This clears caches automatically
            blogPostService.deletePost(id);

            return ResponseEntity.ok("Post deleted");
        } catch (Exception e) {
            logger.error("❌ Failed to delete post {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<BlogPostDTO>> getPostsByUserId(@PathVariable Long userId) {
        try {
            logger.info("📄 GET /api/posts/user/{}", userId);
            java.util.List<BlogPostDTO> posts = blogPostService.getPostsByUserId(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("❌ Error fetching posts for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}