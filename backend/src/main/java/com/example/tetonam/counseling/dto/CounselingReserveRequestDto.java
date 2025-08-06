package com.example.tetonam.counseling.dto;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.user.domain.User;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingReserveRequestDto {
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
