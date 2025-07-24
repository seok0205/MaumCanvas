package com.example.tetonam.diagnosis.repository;

import com.example.tetonam.diagnosis.domain.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<Survey,Long> {
}

