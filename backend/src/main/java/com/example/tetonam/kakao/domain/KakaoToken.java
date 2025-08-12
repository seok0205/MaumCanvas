package com.example.tetonam.kakao.domain;

import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class KakaoToken extends BaseTime {

    @Column(name = "Kakao_Token_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column
    private String AccessToken;

    @Column
    private String RefreshToken;




}
