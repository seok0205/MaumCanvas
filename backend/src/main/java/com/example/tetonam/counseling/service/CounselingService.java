package com.example.tetonam.counseling.service;


import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.dto.CounselingPossibleCounselorResponseDto;
import com.example.tetonam.counseling.dto.CounselingReserveRequestDto;
import com.example.tetonam.counseling.dto.MyCounselingListResponseDto;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.exception.handler.CounselingHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.UserRepository;
import com.example.tetonam.util.aop.DistributedLock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CounselingService {
    private final UserRepository userRepository;
    private final CounselingRepository counselingRepository;

    //테이블의 해당시간에 상담가가 없는사람
    public List<CounselingPossibleCounselorResponseDto> showPossibleCounselor(String email, LocalDateTime time) {
        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        School school=user.getSchool();
        List<User> counselorList=userRepository.findAvailableCounselors(school, Role.COUNSELOR,time);
        // 상담예약 리스트중 해당시간에 상담이 없는 유저

        return counselorList.stream().map(CounselingPossibleCounselorResponseDto::toDto).collect(Collectors.toList());
    }


    @DistributedLock(key = "#lockKey")
    public String createCounselingWithLock(String email, CounselingReserveRequestDto dto,String lockKey) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        User counselor = userRepository.findById(dto.getCounselorId())
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));

        // 락 키를 상담사ID + 예약시간(분단위로 포맷팅)으로 생성

        // 락 키를 메서드 파라미터로 넘겨서 DistributedLock이 적용되게 함
        return this.createCounselingInternal(lockKey, student, counselor, dto);
    }

    // 실제 예약 로직 분리
    @Transactional
    public String createCounselingInternal(String lockKey, User student, User counselor, CounselingReserveRequestDto dto) {
        // 이미 예약 여부 체크
        boolean isReserved = counselingRepository.existsByCounselorAndCounselingTime(counselor, dto.getTime());
        if (isReserved) {
            throw new CounselingHandler(ErrorStatus.ALREADY_RESERVED);
        }

        Counseling counseling = CounselingReserveRequestDto.toEntity(student, counselor, dto);
        counselingRepository.save(counseling);
        return "상담이 예약 되었습니다";
    }

    public List<MyCounselingListResponseDto> showMyCounselingList(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
      return counselingRepository.findByStudentOrderByReservationTimeAsc(user).stream().map(MyCounselingListResponseDto::toDto).toList();


    }

    public MyCounselingListResponseDto showMyRecentCounseling(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Counseling counseling=counselingRepository.findFirstByStudentOrderByReservationTimeDesc(user)
                .orElseThrow(()->new CounselingHandler(ErrorStatus.NOTING_COUNSELING));

        return MyCounselingListResponseDto.toDto(counseling);

    }


//    public String createCounseling(String email, CounselingReserveRequestDto counselingReserveRequestDto) {
//        // 예외처리 필요할 수도 있음 상담가능한 상담사가 없을시 예외처리
//
//        User student=userRepository.findByEmail(email)
//                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
//        User counselor=userRepository.findById(counselingReserveRequestDto.getCounselorId())
//                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
//
//        Counseling counseling=CounselingReserveRequestDto.toEntity(student,counselor,counselingReserveRequestDto);
//        counselingRepository.save(counseling);
//        return "상담이 예약 되었습니다";
//    }
}
