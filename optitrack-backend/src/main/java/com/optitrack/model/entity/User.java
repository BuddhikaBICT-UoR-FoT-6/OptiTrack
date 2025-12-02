package com.optitrack.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Purpose: Core identity entity for the OptiTrack system. Handles
 * authentication credentials and maps to the 'users' table with unique
 * constraints on identity fields.
 * 
 * Design Note: Utilizes Lombok for boilerplate reduction and JPA for ORM
 * mapping.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        /*
         * @Table(uniqueConstraints = ...): This is our database-level "hard" safety
         * net.
         * Even if our Java Service layer logic fails to check for an existing user,
         * the PostgreSQL database itself will reject a duplicate entry.
         */
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    @JsonIgnore // Security: Prevents the hashed password from being leaked in API responses
    private String password;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    /*
     * @JoinTable: This explicitly defines the "Bridge Table" for our Many-to-Many
     * relationship.
     * - 'name': The name of the table in the DB.
     * - 'joinColumns': The column in 'user_roles' that points back to this User.
     * - 'inverseJoinColumns': The column in 'user_roles' that points to the Role.
     */
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false) // Audit Trail: Ensures 'createdAt' is set once and never changed
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}