package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostUpdateDto {
    private String title;
    private String content;

    public static PostUpdateDto toDto(Community community){
        return PostUpdateDto.builder()
                .title(community.getTitle())
                .content(community.getContent())
                .build();
    }
}
