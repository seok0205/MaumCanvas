package com.example.tetonam.community.dto;


import com.example.tetonam.community.domain.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentWriteDto {
    private String content;
    private String nickname;

    public static CommentWriteDto toDto(Comment comment){
        return CommentWriteDto.builder()
                .content(comment.getContent())
                .nickname(comment.getAuthor().getNickname())
                .build();
    }
}
