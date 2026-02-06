package com.project.blog_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.project.blog_application.entities.BlogPost;

import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    // Find post by title (part of the title)
    List<BlogPost> findByTitleContaining(String title);

    // Find post by title (exact match)
    BlogPost findByTitle(String title);

    @Query("SELECT b FROM BlogPost b WHERE b.user.id = :userId")
    List<BlogPost> findByUserId(@Param("userId") Long userId);

    List<BlogPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find post by content (part of the content)
    List<BlogPost> findByContentContaining(String content);

    // Custom JPQL query
    // Find post by title or content having the keyword
    @Query("SELECT p FROM BlogPost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    List<BlogPost> findByTitleOrContentContaining(@Param("keyword") String keyword);

    @Query("SELECT p FROM BlogPost p JOIN FETCH p.user")
    List<BlogPost> findAllWithUser();

    // pagination support for all posts with user data
    // Provide an explicit countQuery to keep totalElements accurate with pagination.
    @Query(
            value = "SELECT p FROM BlogPost p JOIN FETCH p.user",
            countQuery = "SELECT COUNT(p) FROM BlogPost p"
    )
    Page<BlogPost> findAllWithUser(Pageable pageable);

    @Query("SELECT p FROM BlogPost p JOIN FETCH p.user WHERE p.id = :id")
    Optional<BlogPost> findByIdWithUser(@Param("id") Long id);

    // Find top 10 posts by creation date
    List<BlogPost> findTop10ByOrderByCreatedAtDesc();

    // Count posts by user ID - Performance optimization to avoid N+1 query problem
    @Query("SELECT COUNT(p) FROM BlogPost p WHERE p.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
}
