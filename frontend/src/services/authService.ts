import api from './api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post<LoginResponse>('/usuarios/logintoken', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },

  getProfile: async (token: string | null = null) => {
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await api.get('/usuarios/yo', { headers });
    return response.data;
  }
};

export default authService;
