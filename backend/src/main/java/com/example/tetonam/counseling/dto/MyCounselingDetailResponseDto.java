package com.example.tetonam.counseling.dto;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MyCounselingDetailResponseDto {

    private String counselorName;
    private String counselorSchool;
    private String counselorEmail;
    private String counselorPhone;
    private LocalDateTime time;
    private String type;
    private Status status;

    public static MyCounselingDetailResponseDto toDto(Counseling counseling){
        return MyCounselingDetailResponseDto.builder()
                .counselorName(counseling.getCounselor().getName())
                .counselorSchool(counseling.getCounselor().getSchool().toString())
                .counselorEmail(counseling.getCounselor().getEmail())
                .counselorPhone(counseling.getCounselor().getPhone())
                .time(counseling.getReservationTime())
                .type(counseling.getTypes())
                .status(counseling.getStatus())
                .build();
    }

}
