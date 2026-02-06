package com.project.blog_application.services;

import com.project.blog_application.DTO.DashboardStatsDTO;
import com.project.blog_application.DTO.RecentActivityDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class DashboardService {

    private final AdminStatsService adminStatsService;
    private final ActivityService activityService;

    public DashboardService(AdminStatsService adminStatsService, ActivityService activityService) {
        this.adminStatsService = adminStatsService;
        this.activityService = activityService;
    }

    /**
     * Get consolidated dashboard statistics in a single API call.
     * Includes user count, post count, comment count, and recent activities.
     * Results are cached to reduce database load.
     * 
     * @return DashboardStatsDTO containing all dashboard data
     */
    public DashboardStatsDTO getDashboardStats() {
        long userCount = adminStatsService.getUserCount();
        long postCount = adminStatsService.getPostCount();
        long commentCount = adminStatsService.getCommentCount();
        List<RecentActivityDTO> recentActivities = activityService.getRecentActivities();

        return new DashboardStatsDTO(userCount, postCount, commentCount, recentActivities);
    }
}
