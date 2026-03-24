package com.inventra.backend.repository;

import com.inventra.backend.model.AuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(String entityName, String entityId);
}
