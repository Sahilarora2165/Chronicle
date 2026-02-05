// filepath: /Users/sahilarora/Projects/Sprig Boot Projects/blog-application/src/main/java/com/project/blog_application/services/ActivityService.java
package com.project.blog_application.services;

import com.project.blog_application.DTO.RecentActivityDTO;
import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.Comment;
import com.project.blog_application.entities.User;
import com.project.blog_application.repository.BlogPostRepository;
import com.project.blog_application.repository.CommentRepository;
import com.project.blog_application.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired private BlogPostRepository blogPostRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;

    @Transactional(readOnly = true) //  Ensures DB session stays open
    public List<RecentActivityDTO> getRecentActivities() {
        List<RecentActivityDTO> activities = new ArrayList<>();

        // 1. Fetch Posts
        blogPostRepository.findTop10ByOrderByCreatedAtDesc().forEach(post ->
                activities.add(new RecentActivityDTO("BlogPost", "New story: " + post.getTitle(), post.getCreatedAt())));

        // 2. Fetch Comments
        commentRepository.findTop10ByOrderByCreatedAtDesc().forEach(comment -> {
            String username = (comment.getUser() != null) ? comment.getUser().getUsername() : "Anonymous";
            activities.add(new RecentActivityDTO("Comment", "New feedback by " + username, comment.getCreatedAt()));
        });

        // 3. Fetch Users
        userRepository.findTop10ByOrderByCreatedAtDesc().forEach(user ->
                activities.add(new RecentActivityDTO("User", "New member: " + user.getUsername(), user.getCreatedAt())));

        //  Null-safe sorting (prevents NullPointerException if timestamp is null)
        activities.sort(Comparator.comparing(RecentActivityDTO::getTimestamp,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return activities.stream().limit(10).collect(Collectors.toList());
    }
}