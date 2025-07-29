package com.example.tetonam.user.repository;

import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Role;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String username);

  boolean existsByEmail(String username);
  boolean existsByNickname(String nickname);

//  @Query("SELECT u FROM User u JOIN u.roles r WHERE u.school = :school AND r = :role")
//  List<User> findBySchoolAndRole(@Param("school") School school, @Param("role") Role role);
@Query("""
            SELECT DISTINCT u
            FROM User u
            JOIN u.roles r
            WHERE u.school = :school
              AND r = :role
              AND NOT EXISTS (
                SELECT 1
                FROM Counseling c
                WHERE c.counselor = u
                  AND c.reservationTime = :time
              )
        """)
List<User> findAvailableCounselors(@Param("school") School school,
                                   @Param("role") Role role,
                                   @Param("time") LocalDateTime time);


}