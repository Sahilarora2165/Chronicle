package com.project.blog_application.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.project.blog_application.security.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull; // For nullability annotations

@Component // Registers this filter as a Spring-managed bean
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final UserDetailsService userDetailsService; // Service to load user details for authentication
    private final JwtUtil jwtUtil; // Utility for JWT token extraction and validation

    // Constructor injection for required dependencies
    public JwtAuthenticationFilter(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        logger.info("JwtAuthenticationFilter initialized, jwtUtil present: {}", jwtUtil != null);
    }

    // Filters incoming requests to validate JWT and set authentication
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {
        
        String method = request.getMethod();
        String uri = request.getRequestURI();
        logger.info("🔍 Request: {} {}", method, uri);

        String header = request.getHeader("Authorization");
        logger.info("🔍 Authorization Header: {}", header);

        if (header != null && header.toLowerCase().startsWith("bearer ")) {
            String token = header.substring(7);
            logger.info("🔍 Token extracted: {}...", token.substring(0, Math.min(20, token.length())));
            
            try {
                String email = jwtUtil.extractEmail(token);
                logger.info("✅ Email extracted: {}", email);
                
                boolean valid = jwtUtil.validateToken(token, email);
                logger.info("✅ Token valid: {}", valid);
                
                if (valid && email != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    logger.info("✅ User loaded: {}, Authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("✅ Authentication set successfully for {} {}", method, uri);
                } else {
                    logger.warn("⚠️ Invalid token for {} {} - letting Spring Security handle it", method, uri);
                    // ✅ DON'T send error - let Spring Security decide if endpoint needs auth
                }
            } catch (Exception e) {
                logger.error("❌ Token processing error for {} {}: {}", method, uri, e.getMessage());
                // ✅ DON'T send error - let Spring Security handle unauthorized access
            }
        } else {
            logger.info("ℹ️ No Bearer token for {} {} - anonymous request", method, uri);
        }

        // ✅ ALWAYS continue the filter chain - let Spring Security decide what to do
        chain.doFilter(request, response);
    }
}