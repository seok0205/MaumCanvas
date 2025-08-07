package com.example.tetonam.image.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawingRagResult {
    @Column(name = "drawing_rag_result_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String drawingRagResult;

    @JoinColumn(name="drawing_id")
    @OneToOne
    private Drawing drawing;


}
