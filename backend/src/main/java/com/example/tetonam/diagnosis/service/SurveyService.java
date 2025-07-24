package com.example.tetonam.diagnosis.service;


import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.repository.SurveyRepository;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    public String stressCreate(String email, int score, Category category) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Survey survey=Survey.builder().score(score).user(user).category(category).build();
        surveyRepository.save(survey);
        return "설문결과가 저장되었습니다.";
    }
}
