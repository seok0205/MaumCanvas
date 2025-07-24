package com.example.tetonam.diagnosis.dto;

import com.example.tetonam.diagnosis.domain.enums.Category;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ShowAllQuestionnaireDto {

  private Category category;
  private int score;
}