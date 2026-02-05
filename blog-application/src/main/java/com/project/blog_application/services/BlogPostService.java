package com.project.blog_application.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.blog_application.DTO.BlogPostDTO;
import com.project.blog_application.DTO.BlogPostListDTO;
import com.project.blog_application.DTO.PageResponse;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.exceptions.ResourceNotFoundException;
import com.project.blog_application.metrics.BlogMetrics;
import com.project.blog_application.repository.BlogPostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.project.blog_application.services.FileStorageService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BlogPostService {
    private static final Logger logger = LoggerFactory.getLogger(BlogPostService.class);

    private final BlogPostRepository blogPostRepository;
    private final FileStorageService fileStorageService;
    private final BlogMetrics blogMetrics;
    private final ObjectMapper objectMapper;


    @Autowired
    public BlogPostService(
            BlogPostRepository blogPostRepository,
            FileStorageService fileStorageService,
            BlogMetrics blogMetrics,
            ObjectMapper objectMapper
    ) {
        this.blogPostRepository = blogPostRepository;
        this.fileStorageService = fileStorageService;
        this.blogMetrics = blogMetrics;
        this.objectMapper = objectMapper;
    }

    // Cache JSON string for paginated posts
    @Cacheable(value = "blogPostsPageJson", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public String getAllBlogPostsJson(Pageable pageable) throws JsonProcessingException {
        logger.info("🔴 CACHE MISS - Fetching paginated posts from DB (page: {}, size: {})",
                pageable.getPageNumber(), pageable.getPageSize());
        blogMetrics.incrementCacheMiss();

        Page<BlogPost> blogPosts = blogPostRepository.findAllWithUser(pageable);

        List<BlogPostListDTO> dtoList = blogPosts.getContent()
                .stream()
                .map(post -> new BlogPostListDTO(post, fileStorageService))
                .toList();

        PageResponse<BlogPostListDTO> response = new PageResponse<>(
                dtoList,
                blogPosts.getNumber(),
                blogPosts.getSize(),
                blogPosts.getTotalElements(),
                blogPosts.getTotalPages(),
                blogPosts.isLast(),
                blogPosts.isFirst()
        );

        return objectMapper.writeValueAsString(response);
    }

    // Cache JSON string for individual post
    @Cacheable(value = "blogPost", key = "#id")
    public String getBlogPostByIdJson(Long id) throws JsonProcessingException {
        logger.info("CACHE MISS - Fetching blog post {} from DB", id);
        blogMetrics.incrementCacheMiss();

        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id);
        BlogPost blogPost = post.orElseThrow(() ->
                new ResourceNotFoundException("Blog post not found with id: " + id));

        BlogPostDTO dto = new BlogPostDTO(blogPost, fileStorageService);
        return objectMapper.writeValueAsString(dto);
    }

    // Public method that deserializes cached JSON
    public BlogPostDTO getBlogPostDTOById(Long id) throws JsonProcessingException {
        String json = getBlogPostByIdJson(id);
        return objectMapper.readValue(json, BlogPostDTO.class);
    }

    // Non-cached method for internal use (returns entity)
    public BlogPost getBlogPostById(Long id) {
        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id);
        return post.orElseThrow(() ->
                new ResourceNotFoundException("Blog post not found with id: " + id));
    }

    // Cache search by title - returns DTOs
    public List<BlogPostDTO> searchByTitleDTO(String title) {
        logger.info("Cache MISS - Searching posts by title '{}' from DB", title);

        List<BlogPost> posts = blogPostRepository.findByTitleContaining(title);
        return posts.stream()
                .map(post -> new BlogPostDTO(post, fileStorageService))
                .collect(Collectors.toList());

    }

    // Cache posts by user ID - returns DTOs
    public List<BlogPostDTO> searchByUserIdDTO(Long userId) {
        logger.info("Cache MISS - Fetching posts for user {} from DB", userId);

        List<BlogPost> posts = blogPostRepository.findByUserId(userId);
        return posts.stream()
                .map(post -> new BlogPostDTO(post, fileStorageService))
                .collect(Collectors.toList());

    }

    // Cache search by keyword - returns DTOs
    public List<BlogPostDTO> searchByTitleOrContentDTO(String keyword) {
        logger.info("🔍 Cache MISS - Searching posts by keyword '{}' from DB", keyword);

        List<BlogPost> posts = blogPostRepository.findByTitleOrContentContaining(keyword);
        return posts.stream()
                .map(post -> new BlogPostDTO(post, fileStorageService))
                .collect(Collectors.toList());

    }

    // Non-cached versions for backward compatibility
    public List<BlogPost> searchByTitle(String title) {
        return blogPostRepository.findByTitleContaining(title);
    }

    public List<BlogPost> searchByUserId(Long userId) {
        return blogPostRepository.findByUserId(userId);
    }

    public List<BlogPost> searchByTitleOrContent(String keyword) {
        return blogPostRepository.findByTitleOrContentContaining(keyword);
    }

    // Clear all caches when creating post
    @CacheEvict(value = {
            "blogPost",
            "blogPostsPageJson",
            "userCount",
            "postCount",
            "commentCount",
            "dashboardStats"
    }, allEntries = true)
    public BlogPost createPost(BlogPost blogPost, User user) {
        logger.info("Creating new blog post and EVICTING all caches");
        blogPost.setUser(user);
        return blogPostRepository.save(blogPost);
    }

    // Clear individual post cache + all list caches when updating
    @CacheEvict(value = {"blogPost", "blogPostsPageJson"}, allEntries = true)
    public BlogPost updatePost(Long id, BlogPost patch) {

        logger.info(" Updating blog post {} and EVICTING all caches", id);

        // 1 Load managed entity (single source of truth)
        BlogPost existing = getBlogPostById(id);

        // 2 Update title if present
        if (patch.getTitle() != null && !patch.getTitle().isEmpty()) {
            existing.setTitle(patch.getTitle());
        }

        // 3 Update content if present
        if (patch.getContent() != null && !patch.getContent().isEmpty()) {
            existing.setContent(patch.getContent());
        }

        // 4 Update image if present
        if (patch.getImageUrl() != null && !patch.getImageUrl().isEmpty()) {

            // Delete old image safely
            if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                fileStorageService.delete(existing.getImageUrl());
            }

            // Store ONLY filename
            existing.setImageUrl(patch.getImageUrl());
        }

        // 5️⃣ Persist clean state
        return blogPostRepository.save(existing);
    }

    public List<BlogPostDTO> getPostsByUserId(Long userId) {
        // 1. Fetch posts from Repo (assuming you have a findByUserId in Repository)
        List<BlogPost> posts = blogPostRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // 2. Convert to DTOs
        return posts.stream()
                .map(post -> new BlogPostDTO(post, fileStorageService))
                .collect(Collectors.toList());
    }


    // Clear ALL caches when deleting
    @CacheEvict(value = {
            "blogPost",
            "blogPostsPageJson",
            "postCount",
            "dashboardStats"
    }, allEntries = true)
    public void deletePost(Long id) {
        logger.info("Deleting blog post {} and EVICTING all caches", id);

        BlogPost existingPost = getBlogPostById(id);

        // Delete associated image
        if (existingPost.getImageUrl() != null && !existingPost.getImageUrl().isEmpty()) {
            fileStorageService.delete(existingPost.getImageUrl());
        }

        existingPost.getLikes().clear();
        existingPost.getComments().clear();
        blogPostRepository.delete(existingPost);
    }
}
