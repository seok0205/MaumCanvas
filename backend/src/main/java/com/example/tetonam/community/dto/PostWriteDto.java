package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostWriteDto {
    private String title;
    private String content;
    private Category category;
    private String nickname;

    public static PostWriteDto toDto(Community community){
        return PostWriteDto.builder()
                .title(community.getTitle())
                .content(community.getContent())
                .category(community.getCategory())
                .nickname(community.getAuthor().getNickname())
                .build();
    }
}
