package com.example.tetonam.counseling.service;


import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.CounselingImage;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.counseling.dto.*;
import com.example.tetonam.counseling.repository.CounselingImageRepository;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.exception.handler.CounselingHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.repository.DrawingListRepository;
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
    private final CounselingImageRepository counselingImageRepository;
    private final DrawingListRepository drawingListRepository;

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
        DrawingList drawingList=drawingListRepository.findFirstByUserOrderByCreatedDateDesc(student)
                .orElseThrow(()-> new CounselingHandler(ErrorStatus.STUDENT_HAVE_NOT_IMAGE));
        // 락 키를 상담사ID + 예약시간(분단위로 포맷팅)으로 생성

        // 락 키를 메서드 파라미터로 넘겨서 DistributedLock이 적용되게 함
        return this.createCounselingInternal(lockKey, student, counselor, dto,drawingList);
    }

    // 실제 예약 로직 분리
    @Transactional
    public String createCounselingInternal(String lockKey, User student, User counselor, CounselingReserveRequestDto dto, DrawingList drawingList) {
        // 이미 예약 여부 체크
        boolean isReserved = counselingRepository.existsByCounselorAndCounselingTime(counselor, dto.getTime());
        if (isReserved) {
            throw new CounselingHandler(ErrorStatus.ALREADY_RESERVED);
        }

        Counseling counseling = CounselingReserveRequestDto.toEntity(student, counselor, dto);
        counselingRepository.save(counseling);
        counselingImageRepository.save(CounselingImage.builder()
                .counseling(counseling)
                .drawingList(drawingList).build());

        return "상담이 예약 되었습니다";
    }

    public List<StudentCounselingListResponseDto> showStudentCounselingList(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
      return counselingRepository.findByCounselorOrderByReservationTimeAsc(user).stream().map(StudentCounselingListResponseDto::toDto).toList();
    }

    public List<CounselorCounselingListResponseDto> showCounselorCounselingList(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        return counselingRepository.findByStudentOrderByReservationTimeAsc(user).stream().map(CounselorCounselingListResponseDto::toDto).toList();

    }

    public StudentCounselingListResponseDto showMyRecentCounseling(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Counseling counseling=null;
        if(User.hasRole(user,Role.COUNSELOR)){
            counseling = counselingRepository.findFirstByCounselorAndStatusOrderByReservationTimeAsc(user, Status.OPEN)
                    .orElseThrow(() -> new CounselingHandler(ErrorStatus.NOTING_COUNSELING));
        }else if(User.hasRole(user,Role.USER)) {
            counseling = counselingRepository.findFirstByStudentAndStatusOrderByReservationTimeAsc(user, Status.OPEN)
                    .orElseThrow(() -> new CounselingHandler(ErrorStatus.NOTING_COUNSELING));
        }
        return StudentCounselingListResponseDto.toDto(counseling);

    }

    public CounselingDetailResponseDto showMyCounselingDetail(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Counseling counseling=counselingRepository.findById(id)
                .orElseThrow(()-> new CounselingHandler(ErrorStatus.NOTING_COUNSELING));

        // 해당 유저의 예약이 아닐때 비정상적 접속
        if (!counseling.getStudent().equals(user)&&!counseling.getCounselor().equals(user)){
            throw new CounselingHandler(ErrorStatus.COUNSELING_IS_NOT_AUTHORITY);
        }

        if(User.hasRole(user,Role.COUNSELOR)) {
            return CounselingDetailResponseDto.toCounselorDto(counseling);
        } else if (User.hasRole(user,Role.USER)) {
            return CounselingDetailResponseDto.toStudentDto(counseling);
        }else {
            throw new CounselingHandler(ErrorStatus._INTERNAL_SERVER_ERROR);
        }
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
