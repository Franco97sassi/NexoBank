package com.nexobank.backend.domain.user;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.nexobank.backend.auth.dto.UserResponse;
import com.nexobank.backend.auth.security.JwtPrincipal;
import com.nexobank.backend.domain.user.dto.CreateUserRequest;
import com.nexobank.backend.domain.user.dto.UpdateUserRequest;
import com.nexobank.backend.domain.user.dto.UserPageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal JwtPrincipal principal) {
        return userService.findCurrentUser(principal.userId());
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserPageResponse findAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "email") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        return userService.findAll(search, page, size, sortBy, direction);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse findById(@PathVariable UUID userId) {
        return userService.findById(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable UUID userId, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(userId, request);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID userId, @AuthenticationPrincipal JwtPrincipal principal) {
        userService.delete(userId, principal.userId());
    }




}
