package com.optitrack.repository;

import com.optitrack.model.entity.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
}
