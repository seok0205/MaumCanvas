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
public class CounselorCounselingListResponseDto {
    private long id;
    private String student;
    private LocalDateTime time;
    private String type;
    private Status status;

    public static CounselorCounselingListResponseDto toDto(Counseling counseling){
        return CounselorCounselingListResponseDto.builder()
                .id(counseling.getId())
                .student(counseling.getStudent().getName())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }

}
