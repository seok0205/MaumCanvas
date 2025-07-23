package com.example.tetonam.survey.repository;

import com.example.tetonam.user.domain.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<School,String> {

}
