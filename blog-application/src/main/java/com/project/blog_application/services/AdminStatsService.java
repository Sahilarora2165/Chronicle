package com.project.blog_application.services;

import com.project.blog_application.repository.UserRepository;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.project.blog_application.repository.BlogPostRepository;
import com.project.blog_application.repository.CommentRepository;

@Service
public class AdminStatsService {

    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final BlogPostRepository blogPostRepository;

    public AdminStatsService(UserRepository userRepository, CommentRepository commentRepository, BlogPostRepository blogPostRepository){
        this.blogPostRepository = blogPostRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }
    
    public long getUserCount(){
        return userRepository.count();
    }

    public long getCommentCount(){
        return commentRepository.count();
    }

    public long getPostCount(){
        return blogPostRepository.count();
    }

}
