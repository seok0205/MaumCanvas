package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CounselingRepository extends JpaRepository<Counseling,Long> {
}
