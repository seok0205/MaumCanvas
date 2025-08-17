package com.example.tetonam.diagnosis.domain;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
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
public class Survey extends BaseTime {

    @Column(name = "survey_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String score;

    @JoinColumn(name="user_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private User user; // 학교

    @Column
    @Enumerated(EnumType.STRING)
    private Category category;



}
