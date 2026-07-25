package com.nexobank.backend.domain.user;

import com.nexobank.backend.auth.dto.UserResponse;
import com.nexobank.backend.auth.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal JwtPrincipal principal) {
        return userService.findCurrentUser(principal.userId());
    }
}
