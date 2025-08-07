package com.example.tetonam.image.domain;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.image.service.enums.DrawingCategory;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drawing extends BaseTime {

    //집 나무 사람2개
    @Column(name = "drawing_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private DrawingCategory drawingCategory;


    @JoinColumn(name="drawing_list")
    @ManyToOne(fetch = FetchType.LAZY)
    private DrawingList drawingList;

    @OneToOne(mappedBy = "drawing", cascade = CascadeType.ALL, orphanRemoval = true)
    private DrawingRagResult drawingRagResult;


}
