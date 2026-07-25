package com.nexobank.backend.domain.user;

import com.nexobank.backend.auth.dto.AuthMapper;
import com.nexobank.backend.auth.dto.UserResponse;
import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.user.dto.CreateUserRequest;
import com.nexobank.backend.domain.user.dto.UpdateUserRequest;
import com.nexobank.backend.domain.user.dto.UserPageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse findCurrentUser(UUID userId) {
        return AuthMapper.toUserResponse(findUser(userId));
    }

    @Transactional(readOnly = true)
    public UserPageResponse findAll(String search, int page, int size, String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "email", "role", "enabled" -> sortBy;
            default -> "email";
        };
        Specification<User> specification = (root, query, builder) -> {
            if (search == null || search.isBlank()) {
                return builder.conjunction();
            }
            return builder.like(builder.lower(root.get("email")), "%" + search.trim().toLowerCase() + "%");
        };
        var users = userRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(direction, safeSort))
        ).map(AuthMapper::toUserResponse);
        return UserPageResponse.from(users);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId) {
        return AuthMapper.toUserResponse(findUser(userId));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        ensureEmailAvailable(email, null);
        User user = new User(email, passwordEncoder.encode(request.password()), request.role());
        if (!request.enabled()) {
            user.disable();
        }
        return AuthMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(UUID userId, UpdateUserRequest request) {
        User user = findUser(userId);
        String email = normalizeEmail(request.email());
        ensureEmailAvailable(email, userId);
        user.updateEmail(email);
        user.updateRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.updatePassword(passwordEncoder.encode(request.password()));
        }
        if (request.enabled()) {
            user.enable();
        } else {
            user.disable();
        }
        return AuthMapper.toUserResponse(user);
    }

    @Transactional
    public void delete(UUID userId, UUID currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new UserConflictException("You cannot delete your own user");
        }
        userRepository.delete(findUser(userId));
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                 .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    private void ensureEmailAvailable(String email, UUID userId) {
        userRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> {
                    throw new UserConflictException("Email is already registered");
                });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
