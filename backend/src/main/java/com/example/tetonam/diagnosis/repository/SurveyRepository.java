package com.example.tetonam.diagnosis.repository;

import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.user.domain.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SurveyRepository extends JpaRepository<Survey,Long> {

    @Query("SELECT s FROM Survey s WHERE s.user = :userId AND s.category = :category ORDER BY s.createdDate DESC")
    Survey findTopByUserIdAndCategoryOrderByCreatedAtDesc(@Param("userId") User userId, @Param("category") Category category);

    @Query("SELECT s FROM Survey s WHERE s.user = :user AND s.category = :category ORDER BY s.createdDate ASC")
    List<Survey> findByCategoryAndUser(User user, Category category);
}

