package com.inventra.backend.repository;

import com.inventra.backend.model.RefreshToken;
import com.inventra.backend.model.User;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    long deleteByUser(User user);

    long deleteByExpiresAtBefore(Instant cutoff);
}
