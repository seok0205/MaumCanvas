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
    private long id;
    private String content;
    private String nickname;
    private LocalDateTime createdDate;

    public static CommentListDto toDto(Comment comment){
        return CommentListDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .nickname(comment.getAuthor().getNickname())
                .createdDate(comment.getCreatedDate())
                .build();
    }
}
