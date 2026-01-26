package com.project.blog_application.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

@Component
public class BlogMetrics {

    private final Counter postCreatedCounter;
    private final Counter userRegisteredCounter;
    private final Counter commentCreatedCounter;
    private final Timer apiRequestTimer;

    public BlogMetrics(MeterRegistry registry) {
        // Track total posts created
        this.postCreatedCounter = Counter.builder("blog.posts.created.total")
                .description("Total number of blog posts created")
                .register(registry);

        // Track total users registered
        this.userRegisteredCounter = Counter.builder("blog.users.registered.total")
                .description("Total number of users registered")
                .register(registry);

        // Track total comments
        this.commentCreatedCounter = Counter.builder("blog.comments.created.total")
                .description("Total number of comments created")
                .register(registry);

        // Track API response times
        this.apiRequestTimer = Timer.builder("blog_api_requests")
                .description("API request duration")
                .register(registry);
    }

    public void incrementPostCreated() {
        postCreatedCounter.increment();
    }

    public void incrementUserRegistered() {
        userRegisteredCounter.increment();
    }

    public void incrementCommentCreated() {
        commentCreatedCounter.increment();
    }

    public Timer.Sample startTimer() {
        return Timer.start();
    }

    public void recordTimer(Timer.Sample sample) {
        sample.stop(apiRequestTimer);
    }
}