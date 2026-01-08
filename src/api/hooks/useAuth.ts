import { useMutation } from '@tanstack/react-query';
import { userService } from '../services';
import { setSessionId, clearSessionId } from '../client';
import type {
  CreateUserRequest,
  LoginRequest,
  LoginUserResponse,
  RegisterUserAttemptResponse,
} from '../../types/api.types';

export const useLogin = () => {
  return useMutation<LoginUserResponse, Error, LoginRequest>({
    mutationFn: (data) => userService.login(data),
    onSuccess: (response) => {
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation<RegisterUserAttemptResponse, Error, CreateUserRequest>({
    mutationFn: (data) => userService.register(data),
  });
};

export const useLogout = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      clearSessionId();
      localStorage.removeItem('user');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: userService.resetPassword,
  });
};

