package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostPageDto {
    private Long id;
    private String title;
    private String nickname;
    private Category category;
    private int viewCount;

    public static PostPageDto toDto(Community community){
        return PostPageDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .nickname(community.getNickname())
                .category(community.getCategory())
                .viewCount(community.getViewCount())
                .build();
    }
}
