import { useCallback, useState } from 'react';

export const usePasswordToggle = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    showPassword,
    togglePassword,
    setShowPassword,
  };
};
