package com.inventra.backend.repository;

import com.inventra.backend.model.RefreshToken;
import com.inventra.backend.model.User;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    Optional<RefreshToken> findByToken(String token);

    long deleteByUser(User user);

    long deleteByExpiresAtBefore(Instant cutoff);

    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.user.id = :userId")
    void revokeAllByUser(UUID userId);
}
