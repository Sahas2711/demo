package com.inventra.backend.security;

import com.inventra.backend.model.User;
import com.inventra.backend.model.UserRole;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserPrincipal implements UserDetails {

	@Autowired
    private  User user;

    public CustomUserPrincipal(User user) {
        this.user = user;
    }

    // 🔐 Authorities (roles)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        UserRole role = user.getRole();

        // Convert role to Spring Security format: ROLE_ADMIN, ROLE_USER etc.
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // 🔑 Password (IMPORTANT: maps to passwordHash)
    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    // 👤 Username (you're using email)
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // ⏳ Account status checks

    @Override
    public boolean isAccountNonExpired() {
        return true; // you are not handling expiry yet
    }


    @Override
    public boolean isCredentialsNonExpired() {
        return true; // can extend later
    }



    // 🔥 Optional: expose full user if needed
    public User getUser() {
        return user;
    }
}