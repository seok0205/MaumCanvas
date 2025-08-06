package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.CounselingImage;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CounselingImageRepository extends JpaRepository<CounselingImage,Long> {

}
