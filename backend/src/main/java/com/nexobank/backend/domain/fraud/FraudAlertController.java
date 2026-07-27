package com.nexobank.backend.domain.fraud;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nexobank.backend.auth.security.JwtPrincipal;
import com.nexobank.backend.domain.fraud.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@SecurityRequirement(name = "bearerAuth")
@RestController @RequestMapping("/api/v1/fraud-alerts") @PreAuthorize("hasRole('ADMIN')") @Validated
public class FraudAlertController {
 private final FraudAlertService service; public FraudAlertController(FraudAlertService service){this.service=service;}
 @GetMapping public FraudAlertPageResponse findAll(@RequestParam(required=false) FraudAlertStatus status,
  @RequestParam(required=false) FraudAlertSeverity severity,@RequestParam(defaultValue="0") @Min(0) int page,
  @RequestParam(defaultValue="20") @Min(1) @Max(100) int size){return service.findAll(status,severity,page,size);}
 @PatchMapping("/{id}/status") public FraudAlertResponse review(@PathVariable UUID id,@Valid @RequestBody ReviewFraudAlertRequest request,
  @AuthenticationPrincipal JwtPrincipal principal){return service.review(id,request.status(),principal.userId());}
}
