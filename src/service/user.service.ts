import api from './api';
import type { Usuario } from '../data/Usuario';



export const UserService = {
  async listar(): Promise<Usuario[]> {
    // GET http://localhost:8080/api/v1/usuarios
    const { data } = await api.get<Usuario[]>('/api/v1/usuarios');
    return data;
  },

  async obtener(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/api/v1/usuarios/${id}`);
    return data;
  },

  async crear(usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/api/v1/usuarios', usuario);
    return data;
  },

  async actualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.put<Usuario>(`/api/v1/usuarios/${id}`, usuario);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/api/v1/usuarios/${id}`);
  }
};