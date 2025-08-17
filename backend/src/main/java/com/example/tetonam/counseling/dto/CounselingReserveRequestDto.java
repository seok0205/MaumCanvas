package com.example.tetonam.counseling.dto;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.user.domain.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingReserveRequestDto {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime time;
    private String types;
    private Long counselorId;

    public static Counseling toEntity(User student, User counselor,CounselingReserveRequestDto counselingReserveRequestDto){
        return Counseling.builder()
                .counselor(counselor)
                .student(student)
                .reservationTime(counselingReserveRequestDto.getTime())
                .types(counselingReserveRequestDto.getTypes())
                .status(Status.OPEN)
                .build();
    }
}
