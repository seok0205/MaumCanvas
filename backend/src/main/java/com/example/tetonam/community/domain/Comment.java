package com.example.tetonam.community.domain;

import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity     // JPA가 이 클래스를 테이블로 인식
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // id를 기본 키로 자동 생성
    private Long id;

    @JoinColumn(name="community_id", referencedColumnName = "id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Community community;

    @Lob      // content 컬럼을 긴 글로 저장
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_nickname", referencedColumnName = "nickname")
    private User author;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    @PrePersist     // 저장 시 자동 시간 설정
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate      // 수정 시 자동 시간 설정
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
