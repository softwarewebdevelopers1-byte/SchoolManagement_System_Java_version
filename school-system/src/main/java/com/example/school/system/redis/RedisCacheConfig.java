package com.example.school.system.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        // Default fallback config (e.g., 1 Hour TTL)
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                );

        // Map containing custom TTLs for specific cache names
        Map<String, RedisCacheConfiguration> customTtlMap = new HashMap<>();

        // 1. schoolCodeCache -> 2 Hours
        customTtlMap.put("schoolCodeCache", defaultConfig.entryTtl(Duration.ofHours(2)));

        customTtlMap.put("schoolSettingsCache", defaultConfig.entryTtl(Duration.ofHours(24)));

        // 2. classRosters -> 6 Hours
        customTtlMap.put("classRosters", defaultConfig.entryTtl(Duration.ofHours(6)));

        // Paginated student roster pages -> 1 Hour
        customTtlMap.put("studentRosterPages", defaultConfig.entryTtl(Duration.ofHours(1)));

        // 3. draftMarks -> 15 Minutes
        customTtlMap.put("draftMarks", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(customTtlMap) // <--- Registers all TTLs here
                .build();
    }
}