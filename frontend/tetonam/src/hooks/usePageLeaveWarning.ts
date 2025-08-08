import { useCallback, useEffect } from 'react';

/**
 * 페이지 이탈 경고 커스텀 훅
 *
 * beforeunload 이벤트를 활용하여 사용자가 페이지를 벗어나려 할 때
 * 저장되지 않은 변경사항이 있으면 경고 메시지를 표시합니다.
 */
export const usePageLeaveWarning = (
  hasUnsavedChanges: boolean,
  warningMessage: string = '저장되지 않은 그림이 있습니다. 정말 페이지를 떠나시겠습니까?'
) => {
  // beforeunload 이벤트 핸들러
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // 브라우저 표준에 따라 returnValue 설정
        event.preventDefault();
        event.returnValue = warningMessage;
        return warningMessage;
      }
      return undefined;
    },
    [hasUnsavedChanges, warningMessage]
  );

  // popstate 이벤트 핸들러 (뒤로가기/앞으로가기)
  const handlePopState = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm(warningMessage);
      if (!shouldLeave) {
        // 사용자가 취소를 선택하면 현재 페이지에 머물기
        window.history.pushState(null, '', window.location.href);
      }
    }
  }, [hasUnsavedChanges, warningMessage]);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    if (hasUnsavedChanges) {
      // beforeunload 이벤트 등록
      window.addEventListener('beforeunload', handleBeforeUnload);

      // popstate 이벤트 등록 (히스토리 변경 감지)
      window.addEventListener('popstate', handlePopState);

      // 현재 상태를 히스토리에 추가 (뒤로가기 감지를 위해)
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      // 클린업
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, handleBeforeUnload, handlePopState]);

  return {
    // 수동으로 경고 표시하는 함수
    confirmLeave: useCallback(
      (action: () => void) => {
        if (hasUnsavedChanges) {
          const shouldLeave = window.confirm(warningMessage);
          if (shouldLeave) {
            action();
          }
        } else {
          action();
        }
      },
      [hasUnsavedChanges, warningMessage]
    ),
  };
};
