package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface CounselingRepository extends JpaRepository<Counseling,Long> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Counseling c " +
            "WHERE c.counselor = :counselor AND c.reservationTime = :time")
    boolean existsByCounselorAndCounselingTime(User counselor, LocalDateTime time);

    @Query("SELECT COUNT(c) FROM Counseling c WHERE c.counselor = :counselor AND c.reservationTime = :counselingTime")
    long countByCounselorAndCounselingTime(User counselor, LocalDateTime counselingTime);
}
