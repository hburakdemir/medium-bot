import { toast } from 'sonner';

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      className: 'rounded-2xl',
    });
  };

  const showError = (message) => {
    toast.error(message, {
      className: 'rounded-2xl',
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, {
      className: 'rounded-2xl',
    });
  };

  const dismissToast = (id) => {
    toast.dismiss(id);
  };

  return { showSuccess, showError, showLoading, dismissToast };
};
