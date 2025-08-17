// DB에 어떤 데이터를 저장할지 정의
package com.example.tetonam.community.domain;

import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity     // JPA가 이 클래스를 테이블로 인식
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // id를 기본 키로 자동 생성
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT",nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "user_id")
    private User author;

    private int viewCount;

    private String nickname;
    //코멘트 개수
    private long commentCount;
    public void setTitle(String title){ this.title = title;}
    public void setContent(String content){ this.content = content;}
    public void increaseViewCount(){this.viewCount++;}
    public void increaseCommentCount(){this.commentCount++;}
    public void decreaseCommentCount(){this.commentCount--;}
    public void setCommentCount(long commentCount){this.commentCount = commentCount;}
}

