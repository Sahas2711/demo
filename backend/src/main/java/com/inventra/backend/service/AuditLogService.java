package com.inventra.backend.service;

import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.AuditLog;
import com.inventra.backend.model.User;
import com.inventra.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(AuditActionType action, String entityName, String entityId, User performedBy, String oldValue, String newValue) {
        AuditLog log = AuditLog.builder()
                .actionType(action)
                .entityName(entityName)
                .entityId(entityId)
                .performedBy(performedBy)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(log);
    }
}
