package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentListDto {
    private String content;
    private String nickname;
    private LocalDateTime updatedAt;

    public static CommentListDto toDto(Comment comment){
        return CommentListDto.builder()
                .content(comment.getContent())
                .nickname(comment.getAuthor().getNickname())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
