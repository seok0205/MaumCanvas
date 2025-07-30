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
public class MyCounselingListResponseDto {
    private long id;
    private String counselor;
    private LocalDateTime time;
    private String type;
    private Status status;

    public static MyCounselingListResponseDto toDto(Counseling counseling){
        return MyCounselingListResponseDto.builder()
                .id(counseling.getId())
                .counselor(counseling.getCounselor().getName())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }

}
