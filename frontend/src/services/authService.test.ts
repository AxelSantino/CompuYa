import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import authService from './authService';
import api from './api';

// Mock de api
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería llamar a login con los parámetros correctos', async () => {
    const mockResponse = { data: { access_token: 'fake-token', token_type: 'bearer' } };
    (api.post as Mock).mockResolvedValue(mockResponse);

    const email = 'test@example.com';
    const password = 'password123';
    
    await authService.login(email, password);

    expect(api.post).toHaveBeenCalledWith(
      '/usuarios/logintoken',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );

    const callArgs = (api.post as Mock).mock.calls[0][1] as URLSearchParams;
    expect(callArgs.get('username')).toBe(email);
    expect(callArgs.get('password')).toBe(password);
  });

  it('debería obtener el perfil correctamente', async () => {
    const mockProfile = { id: 1, email: 'test@example.com' };
    (api.get as Mock).mockResolvedValue({ data: mockProfile });

    const profile = await authService.getProfile();

    expect(api.get).toHaveBeenCalledWith('/usuarios/yo', { headers: {} });
    expect(profile).toEqual(mockProfile);
  });
});
