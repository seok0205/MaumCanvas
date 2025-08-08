// DB에 어떤 데이터를 저장할지 정의
package com.example.tetonam.community.domain;

import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity     // JPA가 이 클래스를 테이블로 인식
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // id를 기본 키로 자동 생성
    private Long id;

    private String title;

    @Lob      // content 컬럼을 긴 글로 저장
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "user_id")
    private User author;

    private int viewCount;


}

