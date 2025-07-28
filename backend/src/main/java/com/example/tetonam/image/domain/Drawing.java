package com.example.tetonam.image.domain;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drawing extends BaseTime {

    //집 나무 사람2개
    @Column(name = "drawing_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String homeImageUrl;

    @Column(nullable = false)
    private String treeImageUrl;

    @Column(nullable = false)
    private String humanImageFirstUrl;

    @Column(nullable = false)
    private String humanImageSecondUrl;

    @JoinColumn(name="user_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;



}
