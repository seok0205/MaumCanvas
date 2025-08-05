package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder        // Lombok 사용으로 생성자 및 getter 자동 생성
public class PostListDto {

    private Long id;
    private String title;
    private String content;
    private Category category;
    private String author;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Community 엔티티를 PostListDto DTO로 변환
     */
    public static PostListDto from(Community community) {
        return PostListDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .content(community.getContent())
                .category(community.getCategory())
                .author(community.getAuthor().toString())
                .viewCount(community.getViewCount())
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .build();
    }
}
