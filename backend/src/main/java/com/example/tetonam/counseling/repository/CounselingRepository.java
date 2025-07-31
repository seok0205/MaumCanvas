package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CounselingRepository extends JpaRepository<Counseling,Long> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Counseling c " +
            "WHERE c.counselor = :counselor AND c.reservationTime = :time")
    boolean existsByCounselorAndCounselingTime(User counselor, LocalDateTime time);

    @Query("SELECT COUNT(c) FROM Counseling c WHERE c.counselor = :counselor AND c.reservationTime = :counselingTime")
    long countByCounselorAndCounselingTime(User counselor, LocalDateTime counselingTime);
    @Query("SELECT c FROM Counseling c " +
            "WHERE c.student = :student " +
            "ORDER BY " +
            "CASE WHEN c.status = 'OPEN' THEN 0 ELSE 1 END, " +
            "c.reservationTime ASC")
    List<Counseling> findByStudentOrderByReservationTimeAsc(User student);

    Optional<Counseling> findFirstByStudentOrderByReservationTimeDesc(User student);

}
