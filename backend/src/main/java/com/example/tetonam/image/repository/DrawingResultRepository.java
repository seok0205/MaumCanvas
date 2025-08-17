package com.example.tetonam.image.repository;

import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DrawingResultRepository extends JpaRepository<DrawingResult,Long> {


    @Query("SELECT r FROM DrawingResult r WHERE r.drawing.id = :id")
    Optional<DrawingResult> findByDrawing(Long id);
}

