package com.example.tetonam.image.dto;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.image.domain.Drawing;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentDrawingResponseDto {

  private Long id;
  private String category;
  private String imageUrl;
  public static RecentDrawingResponseDto toDto(Drawing drawing){
    return RecentDrawingResponseDto.builder()
            .id(drawing.getId())
            .category(drawing.getDrawingCategory().toString())
            .imageUrl(drawing.getImageUrl())
            .build();
  }
}