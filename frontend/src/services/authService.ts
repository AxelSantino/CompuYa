import api from './api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const authService = {
  login: async (email, password): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post<LoginResponse>('/usuarios/logintoken', params);

    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/usuarios/yo');
    return response.data;
  }
};

export default authService;
