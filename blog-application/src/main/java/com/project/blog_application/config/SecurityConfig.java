package com.project.blog_application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import com.project.blog_application.security.JwtUtil;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public SecurityConfig(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(userDetailsService, jwtUtil);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ Allow CORS properly
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/login",
                                "/api/users/register",
                                "/api/posts",
                                "/api/posts/*",
                                "/api/likes/status",
                                "/api/likes/test",
                                "/api/likes/count/*",
                                "/api/comments",
                                "/api/comments/*",
                                "/api/comments/blog/*",
                                "/api/health",
                                "/actuator/**",
                                "/error",
                                "/uploads/**").permitAll()
                        .requestMatchers(
                                "/api/posts/upload",
                                "/api/users/{id}",
                                "/api/users/me",
                                "/api/users/{id}/statistics",
                                "/api/users/me/posts").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                "/api/posts/{id}/update",
                                "/api/posts/{id}/delete",
                                "/api/comments/{id}/update",
                                "/api/comments/{id}/delete").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                "/api/users",
                                "/api/admin/**",
                                "/api/users/count",
                                "/api/posts/count",
                                "/api/comments/count",
                                "/api/users/**").hasRole("ADMIN")
                        .anyRequest().authenticated());
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow both development and Docker origins
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",  // Development
                "http://localhost",        // Docker on default HTTP port (80)
                "http://frontend"          // Docker internal network
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
