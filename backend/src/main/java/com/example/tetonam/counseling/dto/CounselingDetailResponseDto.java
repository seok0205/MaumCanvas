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
public class CounselingDetailResponseDto {

    private String name;
    private String school;
    private String email;
    private String phone;
    private LocalDateTime time;
    private String type;
    private Status status;

    public static CounselingDetailResponseDto toStudentDto(Counseling counseling){
        return CounselingDetailResponseDto.builder()
                .name(counseling.getCounselor().getName())
                .school(counseling.getCounselor().getSchool().getName())
                .email(counseling.getCounselor().getEmail())
                .phone(counseling.getCounselor().getPhone())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }

    public static CounselingDetailResponseDto toCounselorDto(Counseling counseling) {
        return CounselingDetailResponseDto.builder()
                .name(counseling.getStudent().getName())
                .school(counseling.getStudent().getSchool().getName())
                .email(counseling.getStudent().getEmail())
                .phone(counseling.getStudent().getPhone())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }
}
