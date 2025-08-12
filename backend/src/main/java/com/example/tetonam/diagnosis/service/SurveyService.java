package com.example.tetonam.diagnosis.service;


import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import com.example.tetonam.diagnosis.dto.ShowCategoryQuestionnaireDto;
import com.example.tetonam.diagnosis.repository.SurveyRepository;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    public String questionnaireCreate(String email, String score, Category category) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Survey survey=Survey.builder().score(score).user(user).category(category).build();
        surveyRepository.save(survey);
        return "설문결과가 저장되었습니다.";
    }

    public List<ShowAllQuestionnaireDto> showQuestionnaire(String email) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));

        List<ShowAllQuestionnaireDto> showAllQuestionnaireDtoList=new ArrayList<>();
        for(Category c:Category.values()){
            Survey survey=surveyRepository.findTopByUserAndCategoryOrderByCreatedDateDesc(user,c);
            if(survey==null) {
                showAllQuestionnaireDtoList.add(new ShowAllQuestionnaireDto(c, ""));
                continue;
            }
            showAllQuestionnaireDtoList.add(new ShowAllQuestionnaireDto(c,survey.getScore()));
        }

        return showAllQuestionnaireDtoList;
    }

    public List<ShowCategoryQuestionnaireDto> showCategoryQuestionnaire(String email, Category category) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        List<Survey> surveyList=surveyRepository.findByCategoryAndUser(user,category);
        return surveyList.stream().map(ShowCategoryQuestionnaireDto::toDto).collect(Collectors.toList());
    }
}
