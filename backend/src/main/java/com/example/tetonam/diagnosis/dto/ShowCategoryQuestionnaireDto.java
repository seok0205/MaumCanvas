package com.example.tetonam.diagnosis.dto;

import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowCategoryQuestionnaireDto {

  private Category category;
  private int score;
  private LocalDateTime createdDate;

  public static ShowCategoryQuestionnaireDto toDto(Survey survey){
    return ShowCategoryQuestionnaireDto.builder()
            .category(survey.getCategory())
            .score(survey.getScore())
            .createdDate(survey.getCreatedDate())
            .build();
  }
}
