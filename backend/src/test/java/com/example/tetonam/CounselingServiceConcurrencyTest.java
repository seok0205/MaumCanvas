package com.example.tetonam;

import com.example.tetonam.counseling.dto.CounselingReserveRequestDto;
import com.example.tetonam.counseling.service.CounselingService;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Gender;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest
@Transactional
class CounselingServiceConcurrencyTest {

    @Autowired
    private CounselingService counselingService;

    @Autowired
    private UserRepository userRepository;

    private List<String> studentEmails;
    private Long counselorId;
    private LocalDateTime reserveTime;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    @BeforeEach
    void setUp() {
        // 테스트용 상담사 (admin1@naver.com)
        User counselor = userRepository.findByEmail("admin1@naver.com")
                .orElseThrow(() -> new RuntimeException("상담사 계정이 없습니다."));

        counselorId = counselor.getId();
        reserveTime = LocalDateTime.of(2025, 8, 1, 15, 0);
        studentEmails = new ArrayList<>();

        // 100명의 테스트용 학생 계정 생성
        for (int i = 0; i < 100; i++) {
            String email = "student" + i + "@naver.com";
            studentEmails.add(email);

            if (!userRepository.existsByEmail(email)) {
                User student = User.builder()
                        .email(email)
                        .password("test1234")
                        .birthday("1995-07-22")
                        .name("학생" + i)
                        .nickname("test"+i)
                        .phone("010-1234-1234")
                        .gender(Gender.MAN)
                        .roles(Collections.singletonList(Role.USER))
                        .school(counselor.getSchool()) // 같은 학교로 설정
                        .build();
                userRepository.save(student);
            }
        }
    }

    @Test
    void 동시에_100명이_같은상담사를_같은시간에_예약하면_1명만_성공해야한다() throws InterruptedException {
        int threadCount = 100;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Future<String>> results = new ArrayList<>();

        for (String email : studentEmails) {
            results.add(executorService.submit(() -> {
                try {

                    CounselingReserveRequestDto dto = CounselingReserveRequestDto.builder()
                            .CounselorId(counselorId)
                            .time(reserveTime)
                            .types("심리")
                            .build();
                    String lockKey="counselor:" + dto.getCounselorId() + ":time:" + dto.getTime().format(FORMATTER);


                    return counselingService.createCounselingWithLock(email, dto,lockKey);
                } catch (Exception e) {
                    return "예약 실패: " + e.getMessage();
                } finally {
                    latch.countDown();
                }
            }));
        }

        latch.await();
        executorService.shutdown();

        long successCount = results.stream()
                .map(future -> {
                    try {
                        return future.get();
                    } catch (Exception e) {
                        return e.toString();
                    }
                })
                .peek(System.out::println)
                .filter(msg -> msg.contains("예약 되었습니다"))
                .count();

        assertThat(successCount).isEqualTo(1); // ✅ 단 1명만 예약에 성공해야 함
    }
}
