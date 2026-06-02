package com.example.tetonam;

import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.counseling.dto.CounselingReserveRequestDto;
import com.example.tetonam.counseling.facade.CounselingFacade;
import com.example.tetonam.counseling.repository.CounselingImageRepository;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.repository.DrawingListRepository;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Gender;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.SchoolRepository;
import com.example.tetonam.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ActiveProfiles("test")
@SpringBootTest
@Import(CounselingServiceConcurrencyTest.MockRedisConfig.class)
class CounselingServiceConcurrencyTest {

    @TestConfiguration
    static class MockRedisConfig {
        private final ConcurrentHashMap<String, java.util.concurrent.locks.ReentrantLock> lockMap = new ConcurrentHashMap<>();

        @Bean
        @Primary
        public RedissonClient redissonClient() throws Exception {
            RedissonClient mockClient = org.mockito.Mockito.mock(RedissonClient.class);
            org.mockito.Mockito.when(mockClient.getLock(org.mockito.Mockito.anyString())).thenAnswer(invocation -> {
                String key = invocation.getArgument(0);
                java.util.concurrent.locks.ReentrantLock jvmLock = lockMap.computeIfAbsent(key, k -> new java.util.concurrent.locks.ReentrantLock());
                
                org.redisson.api.RLock mockLock = org.mockito.Mockito.mock(org.redisson.api.RLock.class);
                
                org.mockito.Mockito.when(mockLock.tryLock(
                        org.mockito.Mockito.anyLong(), 
                        org.mockito.Mockito.anyLong(), 
                        org.mockito.Mockito.any(TimeUnit.class)
                )).thenAnswer(inv -> {
                    long waitTime = inv.getArgument(0);
                    TimeUnit unit = inv.getArgument(2);
                    return jvmLock.tryLock(waitTime, unit);
                });
                
                org.mockito.Mockito.doAnswer(inv -> {
                    if (jvmLock.isHeldByCurrentThread()) {
                        jvmLock.unlock();
                    }
                    return null;
                }).when(mockLock).unlock();
                
                return mockLock;
            });
            return mockClient;
        }
    }

    @Autowired
    private CounselingFacade counselingFacade;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private CounselingRepository counselingRepository;

    @Autowired
    private CounselingImageRepository counselingImageRepository;

    @Autowired
    private DrawingListRepository drawingListRepository;

    private School testSchool;
    private User testCounselor;
    private User testStudent;
    private LocalDateTime reserveTime;

    @BeforeEach
    void setUp() {
        // DB 클리어
        cleanup();

        // 1. 학교 생성 및 저장
        testSchool = School.builder()
                .name("마음대학교")
                .build();
        schoolRepository.save(testSchool);

        // 2. 상담사 생성 및 저장
        testCounselor = User.builder()
                .email("counselor@test.com")
                .password("password")
                .name("김상담")
                .nickname("counselor_nick")
                .phone("010-1234-5678")
                .birthday("1980-01-01")
                .gender(Gender.MALE)
                .roles(Collections.singletonList(Role.COUNSELOR))
                .school(testSchool)
                .build();
        userRepository.save(testCounselor);

        // 3. 기본 테스트용 학생 생성 및 저장
        testStudent = User.builder()
                .email("student@test.com")
                .password("password")
                .name("이학생")
                .nickname("student_nick")
                .phone("010-8765-4321")
                .birthday("2000-01-01")
                .gender(Gender.FEMALE)
                .roles(Collections.singletonList(Role.USER))
                .school(testSchool)
                .build();
        userRepository.save(testStudent);

        // 4. 학생의 그림 리스트 저장 (상담 신청 전제 조건)
        DrawingList drawingList = DrawingList.builder()
                .user(testStudent)
                .build();
        drawingListRepository.save(drawingList);

        reserveTime = LocalDateTime.of(2026, 8, 1, 15, 0);
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        counselingImageRepository.deleteAllInBatch();
        counselingRepository.deleteAllInBatch();
        drawingListRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        schoolRepository.deleteAllInBatch();
    }

    @Test
    void 정상적인_상담예약_요청은_성공해야한다() {
        // given
        CounselingReserveRequestDto dto = CounselingReserveRequestDto.builder()
                .counselorId(testCounselor.getId())
                .time(reserveTime)
                .types("심리")
                .build();

        // when
        String result = counselingFacade.createCounseling(testStudent.getEmail(), dto);

        // then
        assertThat(result).isEqualTo("상담이 예약 되었습니다");
        List<Counseling> counselings = counselingRepository.findAll();
        assertThat(counselings).hasSize(1);
        assertThat(counselings.get(0).getStatus()).isEqualTo(Status.OPEN);
        assertThat(counselings.get(0).getStudent().getId()).isEqualTo(testStudent.getId());
        assertThat(counselings.get(0).getCounselor().getId()).isEqualTo(testCounselor.getId());
    }

    @Test
    void 이미_예약된_시간대에_중복예약하면_예외가_발생해야한다() {
        // given
        CounselingReserveRequestDto dto1 = CounselingReserveRequestDto.builder()
                .counselorId(testCounselor.getId())
                .time(reserveTime)
                .types("심리")
                .build();

        // 먼저 예약 성공
        counselingFacade.createCounseling(testStudent.getEmail(), dto1);

        // 다른 학생 추가 생성
        User otherStudent = User.builder()
                .email("other_student@test.com")
                .password("password")
                .name("박학생")
                .nickname("other_nick")
                .phone("010-1111-2222")
                .birthday("2000-05-05")
                .gender(Gender.MALE)
                .roles(Collections.singletonList(Role.USER))
                .school(testSchool)
                .build();
        userRepository.save(otherStudent);

        DrawingList drawingList = DrawingList.builder()
                .user(otherStudent)
                .build();
        drawingListRepository.save(drawingList);

        CounselingReserveRequestDto dto2 = CounselingReserveRequestDto.builder()
                .counselorId(testCounselor.getId())
                .time(reserveTime)
                .types("진로")
                .build();

        // when & then
        assertThatThrownBy(() -> counselingFacade.createCounseling(otherStudent.getEmail(), dto2))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void 기존_예약이_취소된_상태라면_동일시간대_재예약이_성공해야한다() {
        // given
        CounselingReserveRequestDto dto = CounselingReserveRequestDto.builder()
                .counselorId(testCounselor.getId())
                .time(reserveTime)
                .types("심리")
                .build();

        // 예약 생성
        counselingFacade.createCounseling(testStudent.getEmail(), dto);

        // 첫 번째 예약을 CANCEL 상태로 변경 (취소 처리)
        List<Counseling> counselings = counselingRepository.findAll();
        assertThat(counselings).hasSize(1);
        Counseling counseling = counselings.get(0);
        counseling.setStatus(Status.CANCEL);
        counselingRepository.saveAndFlush(counseling);

        // 다른 학생 추가 생성
        User otherStudent = User.builder()
                .email("other_student2@test.com")
                .password("password")
                .name("최학생")
                .nickname("other_nick2")
                .phone("010-3333-4444")
                .birthday("2001-01-01")
                .gender(Gender.MALE)
                .roles(Collections.singletonList(Role.USER))
                .school(testSchool)
                .build();
        userRepository.save(otherStudent);

        DrawingList drawingList = DrawingList.builder()
                .user(otherStudent)
                .build();
        drawingListRepository.save(drawingList);

        // when (취소된 시간대이므로 박학생 이름으로 재예약 시도)
        String result = counselingFacade.createCounseling(otherStudent.getEmail(), dto);

        // then
        assertThat(result).isEqualTo("상담이 예약 되었습니다");
        List<Counseling> activeCounselings = counselingRepository.findAll().stream()
                .filter(c -> c.getStatus() == Status.OPEN)
                .toList();
        assertThat(activeCounselings).hasSize(1);
        assertThat(activeCounselings.get(0).getStudent().getId()).isEqualTo(otherStudent.getId());
    }

    @Test
    void 동시에_50명이_같은상담사를_같은시간에_예약하면_단_1명만_성공해야한다() throws InterruptedException {
        // given
        int threadCount = 50;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        List<String> studentEmails = new ArrayList<>();

        // 50명의 다른 학생들 생성 및 그림 리스트 추가
        for (int i = 0; i < threadCount; i++) {
            String email = "student" + i + "@concurrency.com";
            studentEmails.add(email);

            User student = User.builder()
                    .email(email)
                    .password("test1234")
                    .birthday("1999-01-01")
                    .name("동시성학생" + i)
                    .nickname("concurrent" + i)
                    .phone("010-0000-" + String.format("%04d", i))
                    .gender(Gender.MALE)
                    .roles(Collections.singletonList(Role.USER))
                    .school(testSchool)
                    .build();
            userRepository.save(student);

            DrawingList drawingList = DrawingList.builder()
                    .user(student)
                    .build();
            drawingListRepository.save(drawingList);
        }

        // when
        List<Future<String>> results = new ArrayList<>();
        for (String email : studentEmails) {
            results.add(executorService.submit(() -> {
                try {
                    CounselingReserveRequestDto dto = CounselingReserveRequestDto.builder()
                            .counselorId(testCounselor.getId())
                            .time(reserveTime)
                            .types("심리")
                            .build();
                    return counselingFacade.createCounseling(email, dto);
                } catch (Exception e) {
                    return "예약 실패: " + e.getMessage();
                } finally {
                    latch.countDown();
                }
            }));
        }

        latch.await();
        executorService.shutdown();

        // then
        long successCount = results.stream()
                .map(future -> {
                    try {
                        return future.get();
                    } catch (Exception e) {
                        return e.toString();
                    }
                })
                .filter(msg -> msg.contains("예약 되었습니다"))
                .count();

        // 오직 1명의 예약 요청만 성공해야 함
        assertThat(successCount).isEqualTo(1);
    }
}
