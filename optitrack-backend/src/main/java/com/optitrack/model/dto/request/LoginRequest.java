package com.optitrack.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Purpose: Data structure for login credentials.
 */
@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
