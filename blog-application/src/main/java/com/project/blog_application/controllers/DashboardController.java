package com.project.blog_application.controllers;

import com.project.blog_application.DTO.DashboardStatsDTO;
import com.project.blog_application.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for consolidated dashboard statistics.
 * Provides a single endpoint that returns all dashboard data,
 * reducing frontend API calls from 4 to 1.
 * 
 * Performance improvements:
 * - Single network request instead of 4 parallel requests
 * - Cached response reduces database load
 * - Smaller overall network overhead
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Get consolidated dashboard statistics.
     * Returns user count, post count, comment count, and recent activities in a single response.
     * 
     * @return DashboardStatsDTO containing all dashboard data
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            DashboardStatsDTO stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // Return a JSON error that the React frontend can actually read
            return ResponseEntity.status(500).body("Registry Sync Failed: " + e.getMessage());
        }
    }
}
