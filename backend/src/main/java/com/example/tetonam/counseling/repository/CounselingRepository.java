package com.example.tetonam.counseling.repository;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CounselingRepository extends JpaRepository<Counseling,Long> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Counseling c " +
            "WHERE c.counselor = :counselor AND c.reservationTime = :time")
    boolean existsByCounselorAndCounselingTime(User counselor, LocalDateTime time);

    @Query("SELECT COUNT(c) FROM Counseling c WHERE c.counselor = :counselor AND c.reservationTime = :counselingTime")
    long countByCounselorAndCounselingTime(User counselor, LocalDateTime counselingTime);

    //학생의 상담내역 조회
    @Query("SELECT c FROM Counseling c " +
            "WHERE c.counselor = :counselor " +
            "ORDER BY " +
            "CASE WHEN c.status = 'OPEN' THEN 0 ELSE 1 END, " +
            "c.reservationTime ASC")
    List<Counseling> findByStudentOrderByReservationTimeAsc(User counselor);


    // 다가오는 예약 가져오기 OPEN만 학생
    Optional<Counseling> findFirstByStudentAndStatusOrderByReservationTimeAsc(User user, Status status);

    // 다가오는 예약 가져오기 OPEN만 상담사
    Optional<Counseling> findFirstByCounselorAndStatusOrderByReservationTimeAsc(User user, Status status);

    // 학생의 상담내역 조회
    @Query("SELECT c FROM Counseling c " +
            "WHERE c.student = :student " +
            "ORDER BY " +
            "CASE WHEN c.status = 'OPEN' THEN 0 ELSE 1 END, " +
            "c.reservationTime ASC")
    List<Counseling> findByCounselorOrderByReservationTimeAsc(User student);
}
