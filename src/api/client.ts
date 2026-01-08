import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const SESSION_STORAGE_KEY = 'sessionId';

export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

export const setSessionId = (sessionId: string): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
};

export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const forceLogout = () => {
  clearSessionId();
  localStorage.removeItem('user');
  window.location.href = '/login';
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers.set('Session-Id', sessionId);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      forceLogout();
      return Promise.reject(error);
    }
    
    const errorData = error.response?.data;
    if (errorData) {
      const sessionErrorCodes = [5003, 5004, 5005];
      if (errorData.errorCode && sessionErrorCodes.includes(errorData.errorCode)) {
        forceLogout();
        return Promise.reject(error);
      }
      
      const errorMessage = errorData.message?.toLowerCase() || '';
      if (
        errorMessage.includes('session invalid') ||
        errorMessage.includes('session expired') ||
        errorMessage.includes('session not found')
      ) {
        forceLogout();
        return Promise.reject(error);
      }
    }
    
    if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.message?.toLowerCase() || error.message?.toLowerCase() || '';
      if (
        errorMessage.includes('session') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired')
      ) {
        forceLogout();
        return Promise.reject(error);
      }
    }
    
    const apiError: ApiError = error.response?.data || {
      errorCode: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred',
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
