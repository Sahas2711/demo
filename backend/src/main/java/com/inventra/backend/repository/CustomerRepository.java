package com.inventra.backend.repository;

import com.inventra.backend.model.Customer;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByGstNumber(String gstNumber);

    boolean existsByGstNumber(String gstNumber);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, UUID id);

    boolean existsByGstNumberAndIdNot(String gstNumber, UUID id);

    Page<Customer> findByActive(boolean active, Pageable pageable);
}