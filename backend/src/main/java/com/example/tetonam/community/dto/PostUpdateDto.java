package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateDto {
    private String title;
    private String content;
}
