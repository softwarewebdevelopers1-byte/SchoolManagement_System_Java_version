package com.example.school.system.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.school.system.security.jwt.JwtFilter;

@Configuration
@EnableMethodSecurity // This enables @PreAuthorize
public class RequestFilter {

    private final JwtFilter jwtFilter;

    public RequestFilter(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain RequestFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no authentication required
                        .requestMatchers("/api/login/**").permitAll().requestMatchers("/api/reset/password/token**")
                        .permitAll()
                        .requestMatchers("/api/superadmin/login").permitAll()
                        .requestMatchers("/api/superadmin/invites/**").permitAll()
                        .requestMatchers("/api/auth/teacher/create-account").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/schools/public/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/debug/**").permitAll()
                        .requestMatchers("/api/schools/get/school/for/user").permitAll()
                        .requestMatchers("/api/schools/create-school").permitAll()
                        .requestMatchers("/api/reset/password/request").permitAll()
                        .requestMatchers("/api/reset/password/expiry-checker/**").permitAll()
                        .requestMatchers("/api/complex/login")
                        .permitAll().requestMatchers("/api/health").permitAll().requestMatchers("/api/complex/signup").permitAll()// All other requests require
                                                                                       // authentication
                        .anyRequest().authenticated() // ← This is the key!
                )
                // Add JWT filter before Spring Security's authentication
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }
}
