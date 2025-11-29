import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Producto } from '../data/productos';
import type { Usuario } from '../data/Usuario';
import { ProductService } from '../service/product.service'; 

interface AdminContextType {
    productos: Producto[];
    agregarProducto: (producto: Omit<Producto, 'id'>) => void;
    actualizarProducto: (id: number, producto: Partial<Producto>) => void;
    eliminarProducto: (id: number) => void;
    usuarios: Usuario[];
    actualizarUsuario: (email: string, usuario: Partial<Usuario>) => void;
    eliminarUsuario: (email: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    // ----------------------------------------------------
    // 1. ESTADO DE PRODUCTOS (Desde Backend)
    // ----------------------------------------------------
    const [productos, setProductos] = useState<Producto[]>([]);

    // Cargar productos al iniciar el componente
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await ProductService.listar();
            setProductos(data);
        } catch (error) {
            console.error("Error cargando productos del backend:", error);
        }
    };

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
            alert("Error al actualizar producto");
        }
    };

    const eliminarProducto = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;
        try {
            await ProductService.eliminar(id);
            setProductos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            alert("Error al eliminar producto");
        }
    };

    // ----------------------------------------------------
    // 2. ESTADO DE USUARIOS (Legacy: LocalStorage)
    // *Mantener esto hasta crear el UserService*
    // ----------------------------------------------------
    const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
        const savedUsuarios = localStorage.getItem('usuariosRegistrados');
        return savedUsuarios ? JSON.parse(savedUsuarios) : [];
    });

    useEffect(() => {
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
    }, [usuarios]);

    const actualizarUsuario = (email: string, usuarioActualizado: Partial<Usuario>) => {
        setUsuarios(prev => prev.map(u => 
            u.email === email ? { ...u, ...usuarioActualizado } : u
        ));
    };

    const eliminarUsuario = (email: string) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
        setUsuarios(prev => prev.filter(u => u.email !== email));
    };

    // ----------------------------------------------------
    // 3. RETORNO DEL PROVIDER
    // ----------------------------------------------------
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
        throw new Error('useAdmin solamente debe ser usado con AdminProvider');
    }
    return context;
};