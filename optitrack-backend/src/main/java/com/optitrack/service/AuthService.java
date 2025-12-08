package com.optitrack.service;

import com.optitrack.model.dto.request.LoginRequest;
import com.optitrack.model.dto.request.SignupRequest;
import com.optitrack.model.dto.response.JwtResponse;

/**
 * Purpose: Contract for authentication business logic.
 */
public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);

    void registerUser(SignupRequest signUpRequest);
}
