package com.example.tetonam.counseling.domain;

import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class CounselingImage extends BaseTime {

    @Column(name = "counseling_image_id", updatable = false, unique = true, nullable = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JoinColumn(name="counseling_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Counseling counseling;

    @JoinColumn(name="drawing_list_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private DrawingList drawingList;

}
