import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '@/services/authService';
import React from 'react';

// Mock de authService
vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('debería iniciar sesión correctamente y guardar el token', async () => {
    const mockToken = 'fake-token';
    const mockProfile = { id: 1, email: 'test@example.com', rol: 'admin' };
    
    (authService.login as Mock).mockResolvedValue({ access_token: mockToken });
    (authService.getProfile as Mock).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(authService.getProfile).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockProfile);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('debería cerrar sesión y borrar el token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
