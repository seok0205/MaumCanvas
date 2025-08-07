package com.example.tetonam.image.repository;

import com.example.tetonam.image.domain.DrawingRagResult;
import com.example.tetonam.image.domain.DrawingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DrawingRagResultRepository extends JpaRepository<DrawingRagResult,Long> {

    @Query("SELECT drr FROM DrawingRagResult drr WHERE drr.drawing.id = :id")
    Optional<DrawingRagResult> findByDrawing(Long id);
}

