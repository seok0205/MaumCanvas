// DB에 어떤 데이터를 저장할지 정의
package com.example.tetonam.community.domain;

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
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // id를 기본 키로 자동 생성
    private Long id;

    private String title;

    @Lob      // content 컬럼을 긴 글로 저장
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_nickname", referencedColumnName = "nickname")
    private User author;

    private int viewCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist     // 저장 시 자동 시간 설정
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.viewCount = this.viewCount;
    }

    @PreUpdate      // 수정 시 자동 시간 설정
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

