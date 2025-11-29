import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Producto } from '../data/productos';
import type { Usuario } from '../data/Usuario';
import { ProductService } from '../service/product.service'; 
import { UserService } from '../service/user.service'; // <--- Importamos el nuevo servicio

interface AdminContextType {
    // --- Productos ---
    productos: Producto[];
    agregarProducto: (producto: Omit<Producto, 'id'>) => void;
    actualizarProducto: (id: number, producto: Partial<Producto>) => void;
    eliminarProducto: (id: number) => void;
    
    // --- Usuarios (Actualizado a backend real) ---
    usuarios: Usuario[];
    actualizarUsuario: (id: number, usuario: Partial<Usuario>) => void; // Cambiamos email por id
    eliminarUsuario: (id: number) => void; // Cambiamos email por id
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    // Cargar Datos Iniciales (Productos y Usuarios)
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // Cargar Productos
            const dataProductos = await ProductService.listar();
            setProductos(dataProductos);
            
            // Cargar Usuarios Real desde Backend
            const dataUsuarios = await UserService.listar();
            setUsuarios(dataUsuarios);
        } catch (error) {
            console.error("Error cargando datos del backend:", error);
        }
    };

    // --- Lógica de Productos ---
    const agregarProducto = async (nuevoProducto: Omit<Producto, 'id'>) => {
        try {
            const productoCreado = await ProductService.crear(nuevoProducto);
            setProductos(prev => [...prev, productoCreado]);
        } catch (error) {
            console.error("Error al crear producto:", error);
            alert("Error al crear producto");
        }
    };

    const actualizarProducto = async (id: number, productoActualizado: Partial<Producto>) => {
        try {
            const productoFinal = await ProductService.actualizar(id, productoActualizado);
            setProductos(prev => prev.map(p => (p.id === id ? productoFinal : p)));
        } catch (error) {
            console.error("Error al actualizar producto:", error);
        }
    };

    const eliminarProducto = async (id: number) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await ProductService.eliminar(id);
            setProductos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    };

    // --- Lógica de Usuarios (NUEVA - INTEGRADA CON BACKEND) ---
    const actualizarUsuario = async (id: number, usuarioActualizado: Partial<Usuario>) => {
        try {
            const usuarioFinal = await UserService.actualizar(id, usuarioActualizado);
            setUsuarios(prev => prev.map(u => (u.id === id ? usuarioFinal : u)));
            alert("Usuario actualizado correctamente");
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            alert("No se pudo actualizar el usuario");
        }
    };

    const eliminarUsuario = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este usuario de la base de datos?")) return;
        try {
            await UserService.eliminar(id);
            setUsuarios(prev => prev.filter(u => u.id !== id)); // Usamos ID, no email
            alert("Usuario eliminado");
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            alert("Error al eliminar usuario (¿Quizás tiene boletas asociadas?)");
        }
    };

    return (
        <AdminContext.Provider
            value={{
                productos,
                agregarProducto,
                actualizarProducto,
                eliminarProducto,
                usuarios,
                actualizarUsuario,
                eliminarUsuario,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin error');
    }
    return context;
};