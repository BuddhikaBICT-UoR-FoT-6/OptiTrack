package com.optitrack.security;

import com.optitrack.model.entity.User;
import com.optitrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Purpose: Acts as the bridge between Spring Security and our database.
 * Spring Security calls loadUserByUsername() automatically during the
 * authentication process to verify who is logging in.
 *
 * Design Note: @Transactional is required here because we access the
 * EAGER-loaded roles collection within the same Hibernate session.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads a User entity from the database by username.
     * Converts our custom User entity into Spring Security's UserDetails contract.
     *
     * @param username The username from the login request
     * @return A fully populated UserDetails object
     * @throws UsernameNotFoundException if no user is found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(mapRolesToAuthorities(user))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    /**
     * Converts our Role entities into Spring's GrantedAuthority format.
     * e.g., RoleName.ROLE_ADMIN → SimpleGrantedAuthority("ROLE_ADMIN")
     */
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(User user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());
    }
}
