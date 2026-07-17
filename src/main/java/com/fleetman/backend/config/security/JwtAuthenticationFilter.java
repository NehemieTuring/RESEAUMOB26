package com.fleetman.backend.config.security;

import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.service.InternalAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final InternalAuthService authService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, InternalAuthService authService) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);
        if (jwtUtil.isValid(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UUID userId = jwtUtil.extractUserId(token);
                UserDetail user = authService.loadUserDetail(userId);
                if (user != null && user.isActive()) {
                    List<SimpleGrantedAuthority> authorities = user.roles().stream()
                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                            .toList();
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                // token invalide ou utilisateur absent -> requete non authentifiee
            }
        }
        chain.doFilter(request, response);
    }
}
