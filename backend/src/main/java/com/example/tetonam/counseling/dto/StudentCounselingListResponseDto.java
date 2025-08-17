package com.example.tetonam.counseling.dto;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StudentCounselingListResponseDto {
    private long id;
    private String name;
    private LocalDateTime time;
    private String type;
    private Status status;

    public static StudentCounselingListResponseDto toStudentDto(Counseling counseling){
        return StudentCounselingListResponseDto.builder()
                .id(counseling.getId())
                .name(counseling.getCounselor().getName())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }

    public static StudentCounselingListResponseDto toCounselorDto(Counseling counseling) {
        return StudentCounselingListResponseDto.builder()
                .id(counseling.getId())
                .name(counseling.getStudent().getName())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }
}
