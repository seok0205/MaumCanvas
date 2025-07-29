package com.example.tetonam.counseling.dto;

import com.example.tetonam.user.domain.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingPossibleCounselorResponseDto {

    private long id;
    private String counselorName;

    public static CounselingPossibleCounselorResponseDto toDto(User user){
        return CounselingPossibleCounselorResponseDto.builder()
                .id(user.getId())
                .counselorName(user.getName())
                .build();
    }
}

