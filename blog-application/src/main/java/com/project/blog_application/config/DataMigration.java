package com.project.blog_application.config;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.repository.BlogPostRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataMigration {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @PostConstruct
    public void migrateImageUrls() {
        List<BlogPost> posts = blogPostRepository.findAll();
        for (BlogPost post : posts) {
            if (post.getImageUrl() != null && post.getImageUrl().startsWith("uploads/") && !post.getImageUrl().startsWith("/uploads/")) {
                post.setImageUrl("/" + post.getImageUrl());
                blogPostRepository.save(post);
            }
        }
        System.out.println("Image URL migration completed.");
    }
}