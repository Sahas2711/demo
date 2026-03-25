package com.inventra.backend.repository;

import com.inventra.backend.model.InvoiceItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, UUID> {

    List<InvoiceItem> findByInvoiceId(UUID invoiceId);

    List<InvoiceItem> findByProductId(UUID productId);
}
