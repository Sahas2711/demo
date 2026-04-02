package com.inventra.backend.repository;

import com.inventra.backend.model.Invoice;
import com.inventra.backend.model.InvoiceStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Override
    @EntityGraph(attributePaths = {"customer", "createdBy", "items", "items.product"})
    Page<Invoice> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"customer", "createdBy", "items", "items.product"})
    Optional<Invoice> findById(UUID id);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByCustomerId(UUID customerId, Pageable pageable);

    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    Page<Invoice> findByCreatedAtBetween(Instant start, Instant end, Pageable pageable);

    List<Invoice> findByCreatedAtBetween(Instant start, Instant end);
}
