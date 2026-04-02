package com.inventra.backend.repository;

import com.inventra.backend.model.Product;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByActive(boolean active, Pageable pageable);

    Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.quantityAvailable <= p.reorderLevel ORDER BY p.quantityAvailable ASC")
    List<Product> findLowStockProducts();

    boolean existsByCategoryId(UUID categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"category"})
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(UUID id);
}