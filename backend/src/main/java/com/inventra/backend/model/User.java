package com.inventra.backend.model;

import jakarta.persistence.Column;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@ToString(exclude = {"invoicesCreated", "auditLogs"}, callSuper = true)
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_role", columnList = "role"),
                @Index(name = "idx_users_active", columnList = "is_active"),
                @Index(name = "idx_users_locked", columnList = "account_locked"),
                @Index(name = "idx_users_created_at", columnList = "created_at")
        }
)
public class User extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

        @Column(name = "failed_login_attempts", nullable = false)
        private int failedLoginAttempts = 0;

        @Column(name = "account_locked", nullable = false)
        private boolean accountLocked = false;

        @Column(name = "lock_time")
        private Instant lockTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @OneToMany(mappedBy = "createdBy")
    @Builder.Default
    private List<Invoice> invoicesCreated = new ArrayList<>();

    @OneToMany(mappedBy = "performedBy")
    @Builder.Default
    private List<AuditLog> auditLogs = new ArrayList<>();

    @Column(nullable = true)
    private int tokenVersion;

}
