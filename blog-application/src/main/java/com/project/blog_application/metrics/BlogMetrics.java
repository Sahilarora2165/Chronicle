package com.project.blog_application.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
public class BlogMetrics {

    private final Counter postCreatedCounter;
    private final Counter userRegisteredCounter;
    private final Counter commentCreatedCounter;
    private final Counter postViewCounter;
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;
    private final Timer apiRequestTimer;
    private final AtomicInteger activeUsersGauge;

    public BlogMetrics(MeterRegistry registry) {
        this.postCreatedCounter = Counter.builder("blog_posts_created_total")
                .description("Total number of blog posts created")
                .register(registry);

        this.userRegisteredCounter = Counter.builder("blog_users_registered_total")
                .description("Total number of users registered")
                .register(registry);

        this.commentCreatedCounter = Counter.builder("blog_comments_created_total")
                .description("Total number of comments created")
                .register(registry);

        this.postViewCounter = Counter.builder("blog_post_views_total")
                .description("Total number of post views")
                .register(registry);

        this.cacheHitCounter = Counter.builder("blog_cache_hits_total")
                .description("Total cache hits")
                .register(registry);

        this.cacheMissCounter = Counter.builder("blog_cache_misses_total")
                .description("Total cache misses")
                .register(registry);

        this.apiRequestTimer = Timer.builder("blog_api_requests")
                .description("API request duration")
                .register(registry);

        this.activeUsersGauge = new AtomicInteger(0);
        Gauge.builder("blog_active_users", activeUsersGauge, AtomicInteger::get)
                .description("Number of currently active users")
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

    public void incrementPostView() {
        postViewCounter.increment();
    }

    public void incrementCacheHit() {
        cacheHitCounter.increment();
    }

    public void incrementCacheMiss() {
        cacheMissCounter.increment();
    }

    public void incrementActiveUsers() {
        activeUsersGauge.incrementAndGet();
    }

    public void decrementActiveUsers() {
        activeUsersGauge.decrementAndGet();
    }

    public Timer.Sample startTimer() {
        return Timer.start();
    }

    public void recordTimer(Timer.Sample sample) {
        sample.stop(apiRequestTimer);
    }
}