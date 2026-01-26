package com.project.blog_application.services;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.exceptions.ResourceNotFoundException;
import com.project.blog_application.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.project.blog_application.services.FileStorageService;

import java.util.List;
import java.util.Optional;

@Service
public class BlogPostService {
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

    // Get all blog posts with pagination 
    public Page<BlogPost> getAllBlogPosts(Pageable pageable) {
        return blogPostRepository.findAllWithUser(pageable);
    }

    // Get a single blog post by id
    public BlogPost getBlogPostById(Long id) {
        Optional<BlogPost> post = blogPostRepository.findByIdWithUser(id); // Assuming you add this method
        return post.orElseThrow(() -> new ResourceNotFoundException("Blog post not found with id: " + id));
    }

    // Fetching Blog Posts by Title (Containing a Keyword)
    public List<BlogPost> searchByTitle(String title) {
        return blogPostRepository.findByTitleContaining(title);
    }

    // Fetching Blog Posts by user Id (Author's Posts)
    public List<BlogPost> searchByUserId(Long userId) {
        return blogPostRepository.findByUserId(userId);
    }

    // Searching Blog Posts by Title or Content (Custom JPQL Query)
    public List<BlogPost> searchByTitleOrContent(String keyword) {
        return blogPostRepository.findByTitleOrContentContaining(keyword);
    }

    
    // Create a new blog post
    public BlogPost createPost(BlogPost blogPost , User user) {
        blogPost.setUser(user); // Set the user for the blog post
        return blogPostRepository.save(blogPost);
    }
    
    // Updating an existing blog post (soft update for deleted status)
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        BlogPost existingPost = getBlogPostById(id);
        
        // Update only provided fields (null or empty values are ignored)
        if (updatedPost.getTitle() != null && !updatedPost.getTitle().isEmpty()) {
            existingPost.setTitle(updatedPost.getTitle());
        }
        if (updatedPost.getContent() != null && !updatedPost.getContent().isEmpty()) {
            existingPost.setContent(updatedPost.getContent());
        }
        if (updatedPost.getImageUrl() != null && !updatedPost.getImageUrl().isEmpty()) {

            // delete old image if exists
            if (existingPost.getImageUrl() != null && !existingPost.getImageUrl().isEmpty()) {
                fileStorageService.delete(existingPost.getImageUrl());
            }

            // set new image filename
            existingPost.setImageUrl(updatedPost.getImageUrl());
        }


        return blogPostRepository.save(existingPost);
    }

    // permanently delete a blog post
    public void deletePost(Long id) {
        BlogPost existingPost = getBlogPostById(id);

        // delete associated image
        if (existingPost.getImageUrl() != null && !existingPost.getImageUrl().isEmpty()) {
            fileStorageService.delete(existingPost.getImageUrl());
        }

        existingPost.getLikes().clear();
        existingPost.getComments().clear();
        blogPostRepository.delete(existingPost);
    }

}