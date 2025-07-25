package com.example.tetonam.counseling.service;


import com.example.tetonam.counseling.dto.CounselorResponseDto;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import com.example.tetonam.diagnosis.dto.ShowCategoryQuestionnaireDto;
import com.example.tetonam.diagnosis.repository.SurveyRepository;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CounselingService {
    private final UserRepository userRepository;
    private final CounselingRepository counselingRepository;

    //테이블의 해당시간에 상담가가 없는사람
    public List<CounselorResponseDto> showPossibleCounselor(String email, LocalDateTime time) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        School school=user.getSchool();
//        List<User> counselorList=userRepository.findBySchoolAndUserRole(school, Role.COUNSELOR);

        return null;
    }
}
