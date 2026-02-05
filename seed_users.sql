USE blog_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS LoadUsers$$

CREATE PROCEDURE LoadUsers()
BEGIN
    DECLARE i INT DEFAULT 1;

    -- Loop 10,000 times
    WHILE i <= 10000 DO
        INSERT INTO users (username, email, password, role, created_at)
        VALUES (
            CONCAT('user_', i),
            CONCAT('user_', i, '@example.com'),
            '$2a$10$Xptf7ZAD.oaQoalHP.aHO.s.0pQ.a1.Y.2.0.1.X.1', -- Hash for "password"
            'USER',
            NOW()
        );
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- Execute the procedure
CALL LoadUsers();