import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpcomingCounselingQuery } from './useUpcomingCounselingQuery';
import type { UpcomingCounseling } from '@/types/api';

/**
 * 상담 입장 관련 로직을 캡슐화한 커스텀 훅
 * 
 * "다가오는 상담"의 "입장하기" 버튼과 "상담사 바로가기"의 "학생 상담 시작하기" 버튼에서
 * 동일한 로직을 재사용할 수 있도록 설계
 */
export const useCounselingJoin = () => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  
  // 다가오는 상담 데이터 조회
  const {
    upcomingCounseling,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUpcomingCounselingQuery();

  // 입장하기 핸들러 - 중복클릭 방지 로직 포함
  const handleJoin = useCallback(
    async (counselingOrId?: UpcomingCounseling | number | string | null): Promise<void> => {
      if (isJoining) return; // 이미 처리 중이면 무시

      try {
        setIsJoining(true);
        
        let targetId: number | string;
        
        // 매개변수가 객체인 경우 (UpcomingCounseling)
        if (counselingOrId && typeof counselingOrId === 'object') {
          targetId = counselingOrId.id;
        }
        // 매개변수가 ID인 경우 (number | string)
        else if (typeof counselingOrId === 'number' || typeof counselingOrId === 'string') {
          targetId = counselingOrId;
        }
        // 매개변수가 없거나 null인 경우 현재 다가오는 상담 사용
        else {
          if (!upcomingCounseling) {
            console.warn('입장할 상담이 없습니다.');
            return;
          }
          targetId = upcomingCounseling.id;
        }

        navigate(`/video-call/${targetId}`);
      } catch (error) {
        console.error('상담 입장 중 오류 발생:', error);
      } finally {
        // 네비게이션이 완료되면 상태 리셋 (실제로는 컴포넌트가 언마운트됨)
        setTimeout(() => setIsJoining(false), 1000);
      }
    },
    [navigate, isJoining, upcomingCounseling]
  );

  // 다가오는 상담으로 바로 입장하기 (매개변수 없이 호출)
  const joinUpcomingCounseling = useCallback(
    (): Promise<void> => handleJoin(),
    [handleJoin]
  );

  return {
    // 상태
    upcomingCounseling,
    isLoading,
    isFetching,
    error,
    isJoining,
    
    // 함수
    handleJoin,
    joinUpcomingCounseling,
    refetch,
    
    // 헬퍼
    hasUpcomingCounseling: !!upcomingCounseling,
  };
};
