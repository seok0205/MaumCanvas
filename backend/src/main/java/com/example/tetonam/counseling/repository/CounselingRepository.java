package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface CounselingRepository extends JpaRepository<Counseling,Long> {
    boolean findByCounselorAndReservationTime(User counselorUser, LocalDateTime time);
}
