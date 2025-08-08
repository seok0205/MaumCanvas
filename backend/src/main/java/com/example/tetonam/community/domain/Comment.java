package com.example.tetonam.community.domain;

import com.example.tetonam.user.domain.School;
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
public class Comment extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // id를 기본 키로 자동 생성
    private Long id;

    @JoinColumn(name="community_id", referencedColumnName = "id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Community community;

    @Lob      // content 컬럼을 긴 글로 저장
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User author;

    public void setContent(String content) {this.content = content;}

}
