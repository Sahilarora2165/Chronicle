package com.project.blog_application.services;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.Role;
import com.project.blog_application.entities.User;
import com.project.blog_application.repository.BlogPostRepository;
import com.project.blog_application.repository.CommentRepository;
import com.project.blog_application.repository.UserRepository;
import com.project.blog_application.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service class for managing user-related operations such as registration,
 * authentication,
 * and CRUD operations. Integrates with JwtUtil for token generation.
 */
@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final BlogPostRepository blogPostRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    @Autowired
    public UserService(UserRepository userRepository, BlogPostRepository blogPostRepository,
            CommentRepository commentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.blogPostRepository = blogPostRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        logger.info("UserService initialized with JwtUtil");
    }

    /**
     * Registers a new user with an option to manually set admin role.
     * 
     * @param user    The User entity to register.
     * @param isAdmin Flag to determine if the user should be an admin.
     * @return The saved User entity.
     * @throws RuntimeException if username or email is already taken.
     */
    public User registerUser(User user, boolean isAdmin, MultipartFile profilePicture) {
        logger.info("Registering user: {}, isAdmin: {}", user.getUsername(), isAdmin);
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Store the profile picture and set the file path
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String profilePicturePath = fileStorageService.store(profilePicture);

            user.setProfilePicture(profilePicturePath);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash the password
        user.setRole(isAdmin ? Role.ADMIN : Role.USER); // Set role based on flag
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}, role: {}", savedUser.getUsername(), savedUser.getRole());
        return savedUser;
    }

    /**
     * Retrieves all users from the database.
     * 
     * @return A list of all User entities.
     */
    public List<User> getAllUsers() {
        logger.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.debug("Found {} users", users.size());
        return users;
    }

    /**
     * Retrieves all users from the database with pagination.
     * 
     * @param pageable Pagination and sorting information.
     * @return A page of User entities.
     */
    public Page<User> getAllUsers(PageRequest pageable) {
        logger.debug("Fetching all users with pagination");
        return userRepository.findAll(pageable);
    }

    /**
     * Retrieves all posts for a specific user.
     * 
     * @param userId The ID of the user.
     * @return List of blog posts associated with the user.
     */
    public List<BlogPost> getPostsByUserId(Long userId) {
        User user = getUserById(userId); // Ensure user exists
        logger.debug("Fetching posts for user ID: {}", userId);
        return user.getBlogPosts(); // Assuming BlogPost has a User relationship (e.g., @ManyToOne)
    }

    /**
     * Registers a new user with default USER role, restricting ADMIN assignment.
     * 
     * @param user The User entity to register.
     * @return The saved User entity.
     * @throws RuntimeException if ADMIN role is attempted without manual override.
     */
    public User registerUser(User user, MultipartFile profilePicture) {
        logger.info("Registering default user: {}", user.getUsername());
        if (user.getRole() != null && user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin role can only be set manually or by an admin");
        }
        return registerUser(user, false, profilePicture); // Default to USER role
    }

    /**
     * Authenticates a user and generates a JWT token if credentials are valid.
     * 
     * @param username The username of the user attempting to log in.
     * @param password The plain-text password to verify.
     * @return A JWT token if authentication succeeds.
     * @throws RuntimeException if credentials are invalid.
     */
    public String authenticateUser(String username, String password) {
        logger.info("Attempting to authenticate user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found with username: {}", username);
                    return new RuntimeException("Invalid credentials");
                });
        logger.info("User found: {}, stored password: {}, role: {}", user.getUsername(), user.getPassword(),
                user.getRole());
        if (passwordEncoder.matches(password, user.getPassword())) {
            logger.info("Password matches for: {}, role: {}", username, user.getRole());
            return jwtUtil.generateToken(user.getEmail(), user.getRole()); // Generate token with email
        }
        logger.error("Password does not match. Provided: {}, Stored: {}", password, user.getPassword());
        throw new RuntimeException("Invalid credentials");
    }

    /**
     * Retrieves a user by their ID.
     * 
     * @param id The ID of the user to fetch.
     * @return The User entity.
     * @throws RuntimeException if no user is found with the given ID.
     */
    public User getUserById(Long id) {
        logger.debug("Fetching user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
    }

    /**
     * Retrieves a user by their username.
     * 
     * @param username The username of the user to fetch.
     * @return The User entity.
     * @throws RuntimeException if no user is found with the given username.
     */
    public User getUserByUsername(String username) {
        logger.debug("Fetching user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found with username: {}", username);
                    return new RuntimeException("User not found with username: " + username);
                });
    }

    /**
     * Updates an existing user's details.
     * 
     * @param id          The ID of the user to update.
     * @param updatedUser The User entity with updated details.
     * @return The updated User entity.
     */
    public User updateUser(Long id, User updatedUser, MultipartFile profilePicture) {
        logger.info("Updating user with ID: {}, new username: {}", id, updatedUser.getUsername());
        User existingUser = getUserById(id);

        if (updatedUser.getUsername() != null) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }

        // ✅ Handle profile picture upload
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String profilePicturePath = fileStorageService.store(profilePicture);

            existingUser.setProfilePicture(profilePicturePath);
        }

        User savedUser = userRepository.save(existingUser);
        logger.info("User updated successfully: {}", savedUser.getUsername());
        return savedUser;
    }

    /**
     * Deletes a user by their ID.
     * 
     * @param id The ID of the user to delete.
     */
    public void deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);
        User existingUser = getUserById(id);
        userRepository.delete(existingUser);
        logger.info("User and associated posts deleted: {}", existingUser.getUsername());
    }

    // User statistics - Using optimized count queries instead of loading entire collections
    // This fixes N+1 query problem by using direct COUNT queries
    public Map<String, Long> getUserStatistics(Long userId) {
        // Verify user exists - using existsById is more efficient than loading the full user
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("postCount", blogPostRepository.countByUserId(userId));
        statistics.put("commentCount", commentRepository.countByUserId(userId));
        return statistics;
    }
}