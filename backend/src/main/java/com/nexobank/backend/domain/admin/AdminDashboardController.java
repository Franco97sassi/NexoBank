package com.nexobank.backend.domain.admin;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.nexobank.backend.domain.admin.dto.AdminDashboardResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final AdminDashboardService service;

    public AdminDashboardController(AdminDashboardService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return service.getDashboard();
    }
}
