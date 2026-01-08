import apiClient from '../client';
import type {
  CreateUserRequest,
  LoginRequest,
  UpdatePasswordRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  LoginUserResponse,
  RegisterUserAttemptResponse,
  UpdatePasswordResponse,
  ChangeUsernameResponse,
  UserResponseDto,
} from '../../types/api.types';

const USER_BASE_PATH = '/api/user';

export const userService = {
  register: async (data: CreateUserRequest): Promise<RegisterUserAttemptResponse> => {
    const response = await apiClient.put<RegisterUserAttemptResponse>(
      `${USER_BASE_PATH}/register`,
      data
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginUserResponse> => {
    const response = await apiClient.post<LoginUserResponse>(
      `${USER_BASE_PATH}/login`,
      data
    );
    return response.data;
  },

  resetPassword: async (data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.post<UpdatePasswordResponse>(
      `${USER_BASE_PATH}/reset-password`,
      data
    );
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.post<UpdatePasswordResponse>(
      `${USER_BASE_PATH}/change-password`,
      data
    );
    return response.data;
  },

  changeUsername: async (data: ChangeUsernameRequest): Promise<ChangeUsernameResponse> => {
    const response = await apiClient.post<ChangeUsernameResponse>(
      `${USER_BASE_PATH}/change-username`,
      data
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<UserResponseDto> => {
    const response = await apiClient.get<UserResponseDto>(`${USER_BASE_PATH}/me`);
    return response.data;
  },
};

export default userService;
