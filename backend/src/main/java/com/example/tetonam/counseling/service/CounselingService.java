package com.example.tetonam.counseling.service;


import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.counseling.dto.CounselingPossibleCounselorResponseDto;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CounselingService {
    private final UserRepository userRepository;
    private final CounselingRepository counselingRepository;

    //테이블의 해당시간에 상담가가 없는사람
    public List<CounselingPossibleCounselorResponseDto> showPossibleCounselor(String email, LocalDateTime time) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        School school=user.getSchool();
        List<User> counselorList=userRepository.findAvailableCounselors(school, Role.COUNSELOR,time);
        // 상담예약 리스트중 해당시간에 상담이 없는 유저

        return counselorList.stream().map(CounselingPossibleCounselorResponseDto::toDto).collect(Collectors.toList());
    }

    public String createCounseling(String email, LocalDateTime time, Long userId) {
        User student=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        User counselor=userRepository.findById(userId)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));

        Counseling counseling= Counseling.builder()
                .counselor(counselor)
                .student(student)
                .reservationTime(time)
                .status(Status.OPEN)
                .build();
        counselingRepository.save(counseling);
        return "상담이 예약 되었습니다";
    }
}
