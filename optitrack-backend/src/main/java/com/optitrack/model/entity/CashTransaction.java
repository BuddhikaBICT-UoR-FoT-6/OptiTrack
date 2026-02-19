package com.optitrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String type; // "INCOME", "EXPENSE"
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private Vehicle vehicle;

    private LocalDateTime createdAt;
}
