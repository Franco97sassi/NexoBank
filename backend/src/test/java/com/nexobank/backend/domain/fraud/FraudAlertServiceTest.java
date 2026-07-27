package com.nexobank.backend.domain.fraud;

import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FraudAlertServiceTest {
    @Mock FraudAlertRepository alerts;
    @Mock UserRepository users;
    @Mock FraudAlert alert;
    @Mock User reviewer;

    private FraudAlertService service;

    @BeforeEach
    void setUp() {
        service = new FraudAlertService(alerts, users,
                Clock.fixed(Instant.parse("2026-07-27T12:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    void assignsReviewerAndTimestampWhenAlertIsReviewed() {
        UUID alertId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        when(alerts.findById(alertId)).thenReturn(Optional.of(alert));
        when(users.findById(reviewerId)).thenReturn(Optional.of(reviewer));

        service.review(alertId, FraudAlertStatus.CONFIRMED, reviewerId);

        verify(alert).review(FraudAlertStatus.CONFIRMED, reviewer,
                Instant.parse("2026-07-27T12:00:00Z"));
    }

    @Test
    void rejectsReturningAnAlertToOpen() {
        assertThatThrownBy(() -> service.review(UUID.randomUUID(), FraudAlertStatus.OPEN,
                UUID.randomUUID()))
                .isInstanceOf(FraudAlertConflictException.class);
    }
}
