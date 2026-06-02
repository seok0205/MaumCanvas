package com.example.tetonam.counseling.facade;

import com.example.tetonam.counseling.dto.CounselingReserveRequestDto;
import com.example.tetonam.counseling.service.CounselingService;
import com.example.tetonam.exception.handler.CounselingHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.repository.DrawingListRepository;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class CounselingFacade {

    private final CounselingService counselingService;
    private final UserRepository userRepository;
    private final DrawingListRepository drawingListRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    // 1. DB 조회를 통해 필요한 엔티티 확보 (락 점유 시간 최소화)
    // 2. 외부 서비스(CounselingService)를 호출하여 프록시 기반의 분산 락 및 트랜잭션 활성화
    public String createCounseling(String email, CounselingReserveRequestDto dto) {
        
        // 엔티티 사전 조회 (이 과정은 락 밖에 두어 DB 커넥션 점유를 줄임)
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        
        User counselor = userRepository.findById(dto.getCounselorId())
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        
        DrawingList drawingList = drawingListRepository.findFirstByUserOrderByCreatedDateDesc(student)
                .orElseThrow(() -> new CounselingHandler(ErrorStatus.STUDENT_HAVE_NOT_IMAGE));

        // 락 식별자 생성 (상담사 ID + 예약 시간 분단위 조합으로 경합 범위 통일)
        String lockKey = "counselor:" + counselor.getId() + ":time:" + dto.getTime().format(FORMATTER);

        // 이를 통해 @DistributedLock과 @Transactional 프록시가 정상 작동함
        return counselingService.createCounselingWithLock(lockKey, student, counselor, dto, drawingList);
    }
}
