package com.nexobank.backend.domain.audit;

import java.time.Instant;
import java.util.UUID;

public record AuditEventResponse(
        UUID id,
        UUID actorUserId,
        String actorEmail,
        String eventType,
        String entityType,
        UUID entityId,
        String metadata,
        String ipAddress,
        String userAgent,
        Instant createdAt
) {
    public static AuditEventResponse from(AuditEvent event) {
        return new AuditEventResponse(
                event.getId(),
                event.getActorUser() == null ? null : event.getActorUser().getId(),
                event.getActorUser() == null ? null : event.getActorUser().getEmail(),
                event.getEventType(), event.getEntityType(), event.getEntityId(), event.getMetadata(),
                event.getIpAddress(), event.getUserAgent(), event.getCreatedAt()
        );
    }
}
