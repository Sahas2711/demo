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

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public boolean isAccountLocked() {
        return accountLocked;
    }

    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }

    public Instant getLockTime() {
        return lockTime;
    }

    public void setLockTime(Instant lockTime) {
        this.lockTime = lockTime;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public List<Invoice> getInvoicesCreated() {
        return invoicesCreated;
    }

    public void setInvoicesCreated(List<Invoice> invoicesCreated) {
        this.invoicesCreated = invoicesCreated;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(List<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public void setTokenVersion(int tokenVersion) {
        this.tokenVersion = tokenVersion;
    }

}
