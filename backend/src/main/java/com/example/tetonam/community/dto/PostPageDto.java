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

    public PostPageDto(Long id, String title, String nickname,Category category) {
        this.id = id;
        this.title = title;
        this.nickname = nickname;
        this.category = category;
    }
}
