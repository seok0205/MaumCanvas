package com.example.tetonam.counseling.domain;

import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Counseling extends BaseTime {

    @Column(name = "counseling_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private LocalDateTime reservationTime;

    @JoinColumn(name="student_id")
    @ManyToOne
    private User student; // 학생

    @JoinColumn(name="counselor_id")
    @ManyToOne
    private User counselor; // 상담사

    @Column
    @Enumerated(EnumType.STRING)
    private Status status;



}
