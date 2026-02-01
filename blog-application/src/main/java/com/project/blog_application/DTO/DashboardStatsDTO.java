package com.project.blog_application.DTO;

import java.io.Serializable;
import java.util.List;


public class DashboardStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;
    private long userCount;
    private long postCount;
    private long commentCount;
    private List<RecentActivityDTO> recentActivities;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long userCount, long postCount, long commentCount, List<RecentActivityDTO> recentActivities) {
        this.userCount = userCount;
        this.postCount = postCount;
        this.commentCount = commentCount;
        this.recentActivities = recentActivities;
    }

    // Getters and setters
    public long getUserCount() { return userCount; }
    public void setUserCount(long userCount) { this.userCount = userCount; }

    public long getPostCount() { return postCount; }
    public void setPostCount(long postCount) { this.postCount = postCount; }

    public long getCommentCount() { return commentCount; }
    public void setCommentCount(long commentCount) { this.commentCount = commentCount; }

    public List<RecentActivityDTO> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDTO> recentActivities) { this.recentActivities = recentActivities; }
}
