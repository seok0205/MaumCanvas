import { useCallback, useState } from 'react';

import { getPhoneValidationResult } from '@/utils/phoneUtils';

interface UsePhoneValidationReturn {
  isValid: boolean;
  error: string | null;
  validate: (phone: string) => void;
  clearError: () => void;
}

/**
 * 휴대폰 번호 유효성 검사를 위한 커스텀 훅
 */
export const usePhoneValidation = (): UsePhoneValidationReturn => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((phone: string) => {
    const result = getPhoneValidationResult(phone);
    setIsValid(result.isValid);
    setError(result.error || null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isValid,
    error,
    validate,
    clearError,
  };
};
