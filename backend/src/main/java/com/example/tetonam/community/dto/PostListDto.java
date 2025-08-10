package com.example.tetonam.community.dto;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.util.BaseTime;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder        // Lombok 사용으로 생성자 및 getter 자동 생성
public class PostListDto extends BaseTime {

    private Long id;
    private String title;
    private String content;
    private Category category;
    private String nickname;
    private int viewCount;
    //댓글 개수
    private long commentCount;

    /**
     * Community 엔티티를 PostListDto DTO로 변환
     */
    public static PostListDto from(Community community) {
        return PostListDto.builder()
                .id(community.getId())
                .title(community.getTitle())
                .content(community.getContent())
                .category(community.getCategory())
                .nickname(community.getAuthor().getNickname())
                .viewCount(community.getViewCount())
                //댓글 개수
                .commentCount(community.getCommentCount())
                .build();
    }
}
