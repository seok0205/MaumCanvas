package com.example.tetonam.image.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LLMRequestDto {

    private String question;
    private String category;

    public static LLMRequestDto toDto(String comment,String category){
        return LLMRequestDto.builder()
                .question(comment)
                .category(category)
                .build();
    }

}
