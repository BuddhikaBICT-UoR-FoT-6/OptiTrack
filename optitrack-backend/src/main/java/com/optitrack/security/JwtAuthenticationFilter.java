package com.optitrack.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Purpose: The security "gatekeeper" that intercepts every incoming HTTP
 * request.
 * It checks for a valid JWT token in the Authorization header and, if found,
 * authenticates the user by populating the Spring SecurityContext.
 *
 * Design Note: Extends OncePerRequestFilter to guarantee this filter executes
 * exactly once per request — preventing double-authentication on redirects.
 * If no token is found (e.g., a public /auth/login route), it simply passes
 * the request through without throwing an error.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Core filter logic: extract → validate → authenticate → proceed.
     *
     * @param request     The incoming HTTP request
     * @param response    The outgoing HTTP response
     * @param filterChain The remaining filter chain to pass the request along
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Extract the raw token string from the "Authorization: Bearer <token>"
        // header
        String token = extractTokenFromRequest(request);

        // Step 2: Only proceed if a token was actually present and is cryptographically
        // valid
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {

            // Step 3: Extract the username from the verified token payload
            String username = jwtTokenProvider.getUsernameFromToken(token);

            // Step 4: Load the full UserDetails (with roles) from the database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Step 5: Build a Spring Security authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // Credentials are null — the JWT itself is the proof
                    userDetails.getAuthorities());

            // Attach request metadata (IP address, session ID) to the auth object
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Step 6: Register the authenticated user in the SecurityContext for this
            // request
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Authenticated user '{}' via JWT for URI: {}", username, request.getRequestURI());
        }

        // Step 7: Always pass the request to the next filter, whether authenticated or
        // not
        filterChain.doFilter(request, response);
    }

    /**
     * Parses the raw "Authorization" header and strips the "Bearer " prefix.
     *
     * @param request The incoming HTTP request
     * @return The raw JWT string, or null if the header is absent or malformed
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // Token must start with "Bearer " prefix to be valid
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Strip "Bearer " (7 characters)
        }

        return null;
    }
}
