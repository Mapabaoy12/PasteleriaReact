import api from './api';

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export const CategoryService = {
    async listar(): Promise<Categoria[]> {
        const { data } = await api.get<Categoria[]>('/api/v1/categorias');
        return data;
    }
};