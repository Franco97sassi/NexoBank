package com.nexobank.backend.auth.dto;

import com.nexobank.backend.domain.user.User;

public final class AuthMapper {

    private AuthMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}
