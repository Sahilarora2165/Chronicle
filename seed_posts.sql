USE blog_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS LoadPosts$$

CREATE PROCEDURE LoadPosts()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE long_content LONGTEXT;

    -- This creates a text block of ~300 words
    SET long_content = REPEAT('Chronicle is a minimalist platform built for high-performance reading and writing. This is a stress test to demonstrate the power of Redis caching and Spring Boot optimizations. We are simulating a production environment with heavy data loads to ensure stability. Scaling a Spring Boot application requires careful database indexing and efficient query design. ', 25);

    -- Loop to create 20,000 posts
    WHILE i <= 20000 DO
        INSERT INTO blog_posts (
            title,
            content,
            image_url,
            user_id,
            created_at,
            updated_at,
            is_deleted
        )
        SELECT
            CONCAT('The Future of Engineering - Vol. ', i),
            long_content,
            NULL,
            id, -- This takes the ID from the subquery below
            NOW(),
            NOW(),
            0
        FROM users
        ORDER BY RAND()
        LIMIT 1; -- This picks 1 random existing user for each post

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- Execute the procedure
CALL LoadPosts();