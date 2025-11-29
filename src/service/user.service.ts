import api from './api';
import type { Usuario } from '../data/Usuario';

// El backend usa un DTO específico, podemos adaptar la interfaz o usar 'any' temporalmente
// para los campos que no coinciden (como dirección o teléfono que no están en tu backend aun).

export const UserService = {
  // Listar todos los usuarios
  async listar(): Promise<Usuario[]> {
    // GET http://localhost:8080/api/v1/usuarios
    const { data } = await api.get<Usuario[]>('/api/v1/usuarios');
    return data;
  },

  // Obtener por ID
  async obtener(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/api/v1/usuarios/${id}`);
    return data;
  },

  // Crear usuario (Registro administrativo)
  async crear(usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/api/v1/usuarios', usuario);
    return data;
  },

  // Actualizar usuario
  async actualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.put<Usuario>(`/api/v1/usuarios/${id}`, usuario);
    return data;
  },

  // Eliminar usuario
  async eliminar(id: number): Promise<void> {
    await api.delete(`/api/v1/usuarios/${id}`);
  }
};