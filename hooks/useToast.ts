import { useState } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showSuccess = (message: string) => {
    setToast({ message, type: 'success', visible: true });
  };

  const showError = (message: string) => {
    setToast({ message, type: 'error', visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showSuccess,
    showError,
    hideToast,
  };
};