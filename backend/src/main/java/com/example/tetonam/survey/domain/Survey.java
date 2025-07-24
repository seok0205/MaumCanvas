package com.example.tetonam.survey.domain;

import com.example.tetonam.util.BaseTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
    private long id;

    @Column(nullable = false)
    private int score;


}
