package com.example.school.system.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.school.system.security.jwt.JwtFilter;

@Configuration
@EnableMethodSecurity  //  This enables @PreAuthorize
public class RequestFilter {

    private final JwtFilter jwtFilter;

    public RequestFilter(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain RequestFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                //  Public endpoints - no authentication required
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/debug/**").permitAll()
                
                //  All other requests require authentication
                .anyRequest().authenticated()  // ← This is the key!
            )
            //  Add JWT filter before Spring Security's authentication
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return httpSecurity.build();
    }
}