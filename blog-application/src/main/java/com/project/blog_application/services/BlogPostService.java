package com.project.blog_application.services;

import com.project.blog_application.DTO.BlogPostDTO;
import com.project.blog_application.DTO.PageResponse;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.exceptions.ResourceNotFoundException;
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

    @Autowired
    public BlogPostService(
            BlogPostRepository blogPostRepository,
            FileStorageService fileStorageService
    ) {
        this.blogPostRepository = blogPostRepository;
        this.fileStorageService = fileStorageService;
    }

    // Cache paginated DTOs - key includes page number and size
    public PageResponse<BlogPostDTO> getAllBlogPostsDTO(Pageable pageable) {
        logger.info("🔍 Cache MISS - Fetching paginated posts from DATABASE - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<BlogPost> blogPosts = blogPostRepository.findAllWithUser(pageable);

        List<BlogPostDTO> dtoList = blogPosts.getContent().stream()
                .map(BlogPostDTO::new)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                blogPosts.getNumber(),
                blogPosts.getSize(),
                blogPosts.getTotalElements()
        );
    }

    // Cache individual post DTO by ID
    @Cacheable(value = "blogPost", key = "#id")
    public BlogPostDTO getBlogPostDTOById(Long id) {
        logger.info("Cache MISS - Fetching blog post {} from DATABASE", id);

        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id);
        BlogPost blogPost = post.orElseThrow(() ->
                new ResourceNotFoundException("Blog post not found with id: " + id));

        return new BlogPostDTO(blogPost);
    }

    // Non-cached method for internal use (returns entity)
    public BlogPost getBlogPostById(Long id) {
        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id);
        return post.orElseThrow(() ->
                new ResourceNotFoundException("Blog post not found with id: " + id));
    }

    // Cache search by title - returns DTOs
    public List<BlogPostDTO> searchByTitleDTO(String title) {
        logger.info("🔍 Cache MISS - Searching posts by title '{}' from DATABASE", title);

        List<BlogPost> posts = blogPostRepository.findByTitleContaining(title);
        return posts.stream()
                .map(BlogPostDTO::new)
                .collect(Collectors.toList());
    }

    // Cache posts by user ID - returns DTOs
    public List<BlogPostDTO> searchByUserIdDTO(Long userId) {
        logger.info("Cache MISS - Fetching posts for user {} from DATABASE", userId);

        List<BlogPost> posts = blogPostRepository.findByUserId(userId);
        return posts.stream()
                .map(BlogPostDTO::new)
                .collect(Collectors.toList());
    }

    // Cache search by keyword - returns DTOs
    public List<BlogPostDTO> searchByTitleOrContentDTO(String keyword) {
        logger.info("Cache MISS - Searching posts by keyword '{}' from DATABASE", keyword);

        List<BlogPost> posts = blogPostRepository.findByTitleOrContentContaining(keyword);
        return posts.stream()
                .map(BlogPostDTO::new)
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
    @CacheEvict(value = "blogPost", allEntries = true)
    public BlogPost createPost(BlogPost blogPost, User user) {
        logger.info("Creating new blog post and EVICTING list caches");
        blogPost.setUser(user);
        return blogPostRepository.save(blogPost);
    }

    // Clear individual post cache + all list caches when updating
    @CacheEvict(value = "blogPost", allEntries = true)
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        logger.info("Updating blog post {} and EVICTING all related caches", id);

        BlogPost existingPost = getBlogPostById(id);

        // Update only provided fields
        if (updatedPost.getTitle() != null && !updatedPost.getTitle().isEmpty()) {
            existingPost.setTitle(updatedPost.getTitle());
        }
        if (updatedPost.getContent() != null && !updatedPost.getContent().isEmpty()) {
            existingPost.setContent(updatedPost.getContent());
        }
        if (updatedPost.getImageUrl() != null && !updatedPost.getImageUrl().isEmpty()) {
            // Delete old image if exists
            if (existingPost.getImageUrl() != null && !existingPost.getImageUrl().isEmpty()) {
                fileStorageService.delete(existingPost.getImageUrl());
            }
            existingPost.setImageUrl(updatedPost.getImageUrl());
        }

        return blogPostRepository.save(existingPost);
    }

    // Clear ALL caches when deleting
    @CacheEvict(value = "blogPost", allEntries = true)
    public void deletePost(Long id) {
        logger.info("Deleting blog post {} and EVICTING from ALL caches", id);

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