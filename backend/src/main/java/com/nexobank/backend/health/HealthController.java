package com.nexobank.backend.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public Map<String, String> health() {
        Integer databaseResult =
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        String databaseStatus =
                databaseResult != null && databaseResult == 1
                        ? "UP"
                        : "DOWN";

        return Map.of(
                "application", "NexoBank API",
                "status", "UP",
                "database", databaseStatus
        );
    }
}