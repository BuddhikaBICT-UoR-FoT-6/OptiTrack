package com.optitrack.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

/**
 * Purpose: Payload sent to the frontend upon successful authentication.
 */
@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
}
