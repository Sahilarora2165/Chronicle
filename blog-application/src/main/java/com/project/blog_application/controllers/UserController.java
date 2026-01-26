package com.project.blog_application.controllers;

import com.project.blog_application.entities.BlogPost;
import com.project.blog_application.entities.User;
import com.project.blog_application.DTO.BlogPostDTO;
import com.project.blog_application.DTO.UserDTO;
import com.project.blog_application.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.project.blog_application.repository.UserRepository;
import com.project.blog_application.services.FileStorageService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // ✅ Test Endpoint (Public)
    // @GetMapping("/test")
    // public String test() {
    // return "Hello from UserController";
    // }

    // ✅ Get all users (Admin-only)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        logger.debug("Fetching all users for admin access");
        List<UserDTO> users = userService.getAllUsers().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not logged in.");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        System.out.println("User profile picture path: " + user.getProfilePicture()); // Debugging
        return ResponseEntity.ok(new UserDTO(user));
    }

    // ✅ Get user by ID (Admin-only)
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            logger.info("Retrieved user with ID {}: {}", id, user.getUsername());
            return ResponseEntity.ok(new UserDTO(user));
        } catch (RuntimeException e) {
            logger.error("Error fetching user with id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/me/posts")
    public ResponseEntity<List<BlogPostDTO>> getMyPosts(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BlogPostDTO> blogDTOs = user.getBlogPosts().stream()
                .map(BlogPostDTO::new) // Convert to DTO
                .collect(Collectors.toList());

        return ResponseEntity.ok(blogDTOs);
    }

    // ✅ Register a new user (Public)
    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam("profilePicture") MultipartFile profilePicture) {

        try {
            // Store the profile picture in the uploads folder
            String profilePicturePath = fileStorageService.store(profilePicture);


            // Create a new User object
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setBio(bio);
            user.setProfilePicture(profilePicturePath);

            // Register the user
            User createdUser = userService.registerUser(user, profilePicture);
            return ResponseEntity.status(HttpStatus.CREATED).body(new UserDTO(createdUser));
        } catch (RuntimeException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ✅ Authenticate user (Public)
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody User loginUser) {
        logger.info("Login attempt for username: {}", loginUser.getUsername());
        try {
            String token = userService.authenticateUser(loginUser.getUsername(), loginUser.getPassword());
            logger.info("Login successful, token generated for: {}", loginUser.getUsername());
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            logger.error("Login failed for user {}: {}", loginUser.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {

        if (userDetails == null) {
            logger.error("❌ Authentication failed: No user details found.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        boolean isSelf = currentUser.getId().equals(targetUser.getId());
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isSelf && !isAdmin) {
            logger.warn("❌ Unauthorized attempt to update user {} by {}", id, currentUser.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }

        if (username != null) {
            targetUser.setUsername(username);
        }
        if (email != null) {
            targetUser.setEmail(email);
        }
        if (bio != null) {
            targetUser.setBio(bio);
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            String profilePicturePath = fileStorageService.store(profilePicture);

            targetUser.setProfilePicture(profilePicturePath);
        }

        userRepository.save(targetUser);
        logger.info("✅ User {} updated successfully by {}", targetUser.getUsername(), currentUser.getUsername());
        return ResponseEntity.ok(new UserDTO(targetUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Update only provided fields
        if (username != null) {
            user.setUsername(username);
        }
        if (bio != null) {
            user.setBio(bio);
        }

        // ✅ Handle Profile Picture Upload
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String profilePicturePath = fileStorageService.store(profilePicture);

            user.setProfilePicture(profilePicturePath);
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(new UserDTO(updatedUser));
    }

    // ✅ Delete user account (Self or Admin-only)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                logger.error("No authentication context found for deleting user ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String currentUsername = auth.getName();
            User targetUser = userService.getUserById(id);

            if (targetUser == null) {
                logger.error("User not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            boolean isSelf = currentUsername.equals(targetUser.getUsername());
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isSelf && !isAdmin) {
                logger.warn("Unauthorized attempt to delete user {} by {}", id, currentUsername);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only the user or an admin can delete this account");
            }

            userService.deleteUser(id);
            logger.info("User and associated posts deleted successfully: {}, by {}", targetUser.getUsername(),
                    currentUsername);
            return ResponseEntity.ok("User and associated posts deleted successfully");
        } catch (RuntimeException e) {
            logger.error("Error deleting user with id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while deleting user: " + e.getMessage());
        }
    }

    @GetMapping("/users/{id}/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BlogPost>> getUserPosts(@PathVariable Long id) {
        List<BlogPost> posts = userService.getPostsByUserId(id);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Long>> getUserStatistics(@PathVariable Long id) {
        Map<String, Long> statistics = userService.getUserStatistics(id);
        return ResponseEntity.ok(statistics);
    }
}