import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/services';
import { setSessionId, clearSessionId, getSessionId } from '../api/client';
import type { ApiError, ChangePasswordRequest, ChangeUsernameRequest } from '../types/api.types';

interface User {
  id: string;
  email: string;
  username: string;
}

interface RegisterResult {
  success: boolean;
  recoveryCode?: string;
  error?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

interface ChangeUsernameResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, username: string, password: string, passwordConfirmation: string, location?: string) => Promise<RegisterResult>;
  logout: () => void;
  resetPasswordWithToken: (token: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<ChangePasswordResult>;
  changeUsername: (currentPassword: string, newUsername: string) => Promise<ChangeUsernameResult>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [sessionId, setSessionIdState] = useState<string | null>(() => {
    return getSessionId();
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const isAuthenticated = !!user && !!sessionId;

  const clearAllCaches = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const fetchUserInfo = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoadingUser(true);
      const userInfo = await userService.getCurrentUser();
      const fetchedUser: User = {
        id: userInfo.id,
        email: userInfo.email,
        username: userInfo.username,
      };
      setUser(fetchedUser);
      localStorage.setItem('user', JSON.stringify(fetchedUser));
      return fetchedUser;
    } catch {
      return user;
    } finally {
      setIsLoadingUser(false);
    }
  }, [user]);

  useEffect(() => {
    if (sessionId && !isLoadingUser) {
      fetchUserInfo();
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      clearAllCaches();
      
      const response = await userService.login({ email, password });
      const isSuccess = response.errorCode === 1000 || response.errorCode === 5002;
      
      if (isSuccess && response.sessionId) {
        setSessionId(response.sessionId);
        setSessionIdState(response.sessionId);
        
        try {
          const userInfo = await userService.getCurrentUser();
          const loggedInUser: User = {
            id: userInfo.id,
            email: userInfo.email,
            username: userInfo.username,
          };
          
          setUser(loggedInUser);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
        } catch {
          const username = email.split('@')[0] || 'user';
          const loggedInUser: User = {
            id: response.sessionId,
            email,
            username,
          };
          
          setUser(loggedInUser);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.message || 'Login failed' 
      };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'An error occurred during login' 
      };
    }
  }, [clearAllCaches]);

  const register = useCallback(async (
    email: string, 
    username: string, 
    password: string,
    passwordConfirmation: string,
    location?: string
  ): Promise<RegisterResult> => {
    try {
      const response = await userService.register({
        email,
        username,
        password,
        passwordConfirmation,
        location,
      });
      
      if (response.errorCode === 1000 && response.uniqueCode) {
        return { 
          success: true, 
          recoveryCode: response.uniqueCode 
        };
      }
      
      if (response.errorCode && response.errorCode !== 1000) {
        return { 
          success: false, 
          error: response.message || 'Registration failed' 
        };
      }
      
      if (response.uniqueCode) {
        return { 
          success: true, 
          recoveryCode: response.uniqueCode 
        };
      }
      
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'An error occurred during registration' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearAllCaches();
    setUser(null);
    setSessionIdState(null);
    clearSessionId();
    localStorage.removeItem('user');
  }, [clearAllCaches]);

  const resetPasswordWithToken = useCallback(async (
    token: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      const response = await userService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      return response.errorCode === 1000;
    } catch {
      return false;
    }
  }, []);

  const changePassword = useCallback(async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ChangePasswordResult> => {
    if (!user?.email) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const request: ChangePasswordRequest = {
        email: user.email,
        oldPassword,
        newPassword,
        confirmPassword,
      };

      const response = await userService.changePassword(request);
      
      if (response.errorCode === 1000) {
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.message || 'Failed to change password' 
      };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'An error occurred while changing password' 
      };
    }
  }, [user?.email]);

  const changeUsername = useCallback(async (
    currentPassword: string,
    newUsername: string
  ): Promise<ChangeUsernameResult> => {
    if (!user?.email) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const request: ChangeUsernameRequest = {
        email: user.email,
        currentPassword,
        newUsername,
      };

      const response = await userService.changeUsername(request);
      
      if (response.errorCode === 1000) {
        const updatedUser = { ...user, username: newUsername };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.message || 'Failed to change username' 
      };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'An error occurred while changing username' 
      };
    }
  }, [user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      sessionId,
      isAuthenticated,
      login, 
      register, 
      logout,
      resetPasswordWithToken,
      changePassword,
      changeUsername,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
