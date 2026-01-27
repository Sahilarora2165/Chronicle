package com.project.blog_application.services;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.exceptions.ResourceNotFoundException;
import com.project.blog_application.repository.BlogPostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.project.blog_application.services.FileStorageService;

import java.util.List;
import java.util.Optional;

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

    // Cache paginated results - key includes page number and size
    @Cacheable(value = "blogPosts", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public List<BlogPost> getAllBlogPosts(Pageable pageable) {
        logger.info("🔍 Fetching paginated posts from DATABASE (cache miss)");
        return blogPostRepository.findAllWithUser(pageable).getContent();
    }


    // Cache individual blog post by ID
    @Cacheable(value = "blogPost", key = "#id")
    public BlogPost getBlogPostById(Long id) {
        logger.info("🔍 Fetching blog post {} from DATABASE (cache miss)", id);
        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id);
        return post.orElseThrow(() -> new ResourceNotFoundException("Blog post not found with id: " + id));
    }

    // Cache search by title
    @Cacheable(value = "blogPostsByTitle", key = "#title")
    public List<BlogPost> searchByTitle(String title) {
        logger.info("🔍 Searching posts by title '{}' from DATABASE (cache miss)", title);
        return blogPostRepository.findByTitleContaining(title);
    }

    // Cache posts by user ID
    @Cacheable(value = "blogPostsByUser", key = "#userId")
    public List<BlogPost> searchByUserId(Long userId) {
        logger.info("🔍 Fetching posts for user {} from DATABASE (cache miss)", userId);
        return blogPostRepository.findByUserId(userId);
    }

    // Cache search by keyword
    @Cacheable(value = "blogPostsByKeyword", key = "#keyword")
    public List<BlogPost> searchByTitleOrContent(String keyword) {
        logger.info("🔍 Searching posts by keyword '{}' from DATABASE (cache miss)", keyword);
        return blogPostRepository.findByTitleOrContentContaining(keyword);
    }

    // Update cache when creating post + evict list caches
    @CachePut(value = "blogPost", key = "#result.id")
    @CacheEvict(value = {"blogPosts", "blogPostsByUser", "blogPostsByTitle", "blogPostsByKeyword"}, allEntries = true)
    public BlogPost createPost(BlogPost blogPost, User user) {
        logger.info(" Creating new blog post and updating cache");
        blogPost.setUser(user);
        return blogPostRepository.save(blogPost);
    }

    // Update cache when updating post + evict list caches
    @CachePut(value = "blogPost", key = "#id")
    @CacheEvict(value = {"blogPosts", "blogPostsByUser", "blogPostsByTitle", "blogPostsByKeyword"}, allEntries = true)
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        logger.info("Updating blog post {} and refreshing cache", id);
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

    // Remove from cache when deleting + evict all list caches
    @CacheEvict(value = {"blogPost", "blogPosts", "blogPostsByUser", "blogPostsByTitle", "blogPostsByKeyword"}, allEntries = true)
    public void deletePost(Long id) {
        logger.info("🗑️ Deleting blog post {} and evicting from all caches", id);
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