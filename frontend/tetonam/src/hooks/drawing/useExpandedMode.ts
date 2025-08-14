import { useCallback, useState } from 'react';

/**
 * 캔버스 확대 모드 관리를 위한 커스텀 훅
 * 안내 영역 접기와 도구모음 팔레트 변환을 담당
 * React 공식 문서 best practices 준수
 */
export const useExpandedMode = () => {
  const [isExpandedMode, setIsExpandedMode] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  // 확대 모드 진입
  const enterExpandedMode = useCallback(() => {
    setIsExpandedMode(true);
    setIsToolbarVisible(false);
  }, []);

  // 확대 모드 종료
  const exitExpandedMode = useCallback(() => {
    setIsExpandedMode(false);
    setIsToolbarVisible(false);
  }, []);

  // 도구모음 토글
  const toggleToolbar = useCallback(() => {
    setIsToolbarVisible(prev => !prev);
  }, []);

  return {
    isExpandedMode,
    isToolbarVisible,
    enterExpandedMode,
    exitExpandedMode,
    toggleToolbar,
  };
};
