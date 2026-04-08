package com.inventra.backend.service;

import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    @PersistenceContext
    private EntityManager entityManager;

    public void log(AuditActionType action,
                    String entityName,
                    String entityId,
                    User performedBy,
                    String oldValue,
                    String newValue) {

        try {
            entityManager.createNativeQuery("""
                INSERT INTO audit_logs 
                (id, action_type, entity_name, entity_id, performed_by, old_value, new_value, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, CAST(? AS jsonb), CAST(? AS jsonb), ?, ?)
            """)
            .setParameter(1, UUID.randomUUID())
            .setParameter(2, action.name())
            .setParameter(3, entityName)
            .setParameter(4, entityId)
            .setParameter(5, performedBy != null ? performedBy.getId() : null)
            .setParameter(6, oldValue)
            .setParameter(7, newValue)
            .setParameter(8, Instant.now())
            .setParameter(9, Instant.now())
            .executeUpdate();

        } catch (Exception e) {
            // NEVER break main flow
            System.out.println("Audit log failed: " + e.getMessage());
        }
    }
}