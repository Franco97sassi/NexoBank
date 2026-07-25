package com.nexobank.backend.domain.user;

import com.nexobank.backend.auth.dto.AuthMapper;
import com.nexobank.backend.auth.dto.UserResponse;
import com.nexobank.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse findCurrentUser(UUID userId) {
        return userRepository.findById(userId)
                .map(AuthMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
