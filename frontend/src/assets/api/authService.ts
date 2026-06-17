import { httpPost } from './http';
import type { User } from './types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;  // Add JWT token
  message: string;
}

export const AuthService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await httpPost<AuthResponse>('/auth/login', data);
    // Store token after successful login
    if (response.success && response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await httpPost<AuthResponse>('/auth/register', data);
    // Store token after successful registration
    if (response.success && response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }
    return response;
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return null;
      }
      const user = JSON.parse(userStr);
      // Kiểm tra user có đủ thông tin cần thiết không
      if (!user || typeof user.id !== 'number') {
        console.error('Invalid user object in localStorage:', user);
        // Xóa user không hợp lệ
        localStorage.removeItem('user');
        return null;
      }
      // Verify token exists
      if (!this.getToken()) {
        console.warn('User data exists but no token found. Clearing user data.');
        this.clearUser();
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  clearUser(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
  },

  isLoggedIn(): boolean {
    return !!this.getUser() && !!this.getToken();
  },
}; 