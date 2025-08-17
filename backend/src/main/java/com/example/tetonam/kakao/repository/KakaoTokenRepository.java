package com.example.tetonam.kakao.repository;

import com.example.tetonam.diagnosis.domain.Survey;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.kakao.domain.KakaoToken;
import com.example.tetonam.user.domain.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KakaoTokenRepository extends JpaRepository<KakaoToken,Long> {


}

