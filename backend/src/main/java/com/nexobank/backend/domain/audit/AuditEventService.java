package com.nexobank.backend.domain.audit;

import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuditEventService {
    private final AuditEventRepository events;
    private final UserRepository users;

    public AuditEventService(AuditEventRepository events, UserRepository users) {
        this.events = events;
        this.users = users;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID actorUserId, String eventType, String entityType, UUID entityId,
                       String metadata, String ipAddress, String userAgent) {
        User actor = actorUserId == null ? null : users.findById(actorUserId).orElse(null);
        events.save(new AuditEvent(actor, eventType, entityType, entityId, metadata,
                limit(ipAddress, 45), limit(userAgent, 255)));
    }

    @Transactional(readOnly = true)
    public AuditEventPageResponse findAll(String eventType, String entityType, UUID actorUserId,
                                          Instant from, Instant to, int page, int size) {
        Specification<AuditEvent> specification = (root, query, builder) -> builder.conjunction();
        if (eventType != null && !eventType.isBlank()) {
            specification = specification.and((root, query, builder) ->
                    builder.equal(root.get("eventType"), eventType.trim().toUpperCase()));
        }
        if (entityType != null && !entityType.isBlank()) {
            specification = specification.and((root, query, builder) ->
                    builder.equal(root.get("entityType"), entityType.trim().toUpperCase()));
        }
        if (actorUserId != null) {
            specification = specification.and((root, query, builder) ->
                    builder.equal(root.get("actorUser").get("id"), actorUserId));
        }
        if (from != null) {
            specification = specification.and((root, query, builder) ->
                    builder.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            specification = specification.and((root, query, builder) ->
                    builder.lessThanOrEqualTo(root.get("createdAt"), to));
        }
        return AuditEventPageResponse.from(events.findAll(specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(AuditEventResponse::from));
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.isBlank()) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
