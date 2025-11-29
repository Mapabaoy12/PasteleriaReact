import api from './api';

export const AuthService = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<string>('/auth/login', { email, password });
    return data; 
  },

  async registro(usuario: any): Promise<any> {
    const { data } = await api.post('/api/v1/usuarios', usuario);
    return data;
  }
};