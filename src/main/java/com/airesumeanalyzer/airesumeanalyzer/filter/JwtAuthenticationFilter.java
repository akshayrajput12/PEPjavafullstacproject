package com.airesumeanalyzer.airesumeanalyzer.filter;

import com.airesumeanalyzer.airesumeanalyzer.service.CustomUserDetailsService;
import com.airesumeanalyzer.airesumeanalyzer.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println("Processing request: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token found in Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7);
            userEmail = jwtUtil.extractUsername(jwt);
            System.out.println("Extracted username from token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                boolean isValid = jwtUtil.validateToken(jwt, userDetails.getUsername());
                System.out.println("Token validation result for " + userEmail + ": " + isValid);

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication verified and set in SecurityContext");
                } else {
                    System.out.println("Token invalid for user: " + userEmail);
                }
            }
        } catch (Exception e) {
            System.err.println("JWT Authentication error: " + e.getMessage());
            e.printStackTrace();
            // Don't throw, let the filter chain proceed (which will likely result in 403 if auth is missing)
        }
        
        filterChain.doFilter(request, response);
    }
}
