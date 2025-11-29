import api from './api';
import type { Producto } from '../data/productos';

export const ProductService = {
  // Listar
  async listar(): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>('/api/v1/productos');
    return data;
  },

  // Crear
  async crear(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const { data } = await api.post<Producto>('/api/v1/productos', producto);
    return data;
  },

  // Actualizar (Nuevo)
  async actualizar(id: number, producto: Partial<Producto>): Promise<Producto> {
    const { data } = await api.put<Producto>(`/api/v1/productos/${id}`, producto);
    return data;
  },

  // Eliminar (Nuevo)
  async eliminar(id: number): Promise<void> {
    await api.delete(`/api/v1/productos/${id}`);
  }
};