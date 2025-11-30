import { useEffect, useState } from "react";
import { Destacadas } from "../components/home/Destacado";
import { ProductosGrid } from "../components/home/ProductosGrid";
import { ProductService } from "../service/product.service"; //
import type { Producto } from "../data/productos";

export const HomePage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                // Esto llama a GET /api/v1/productos en tu micro-core
                const data = await ProductService.listar();
                setProductos(data);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    if (loading) return <div className="text-center py-20">Cargando pasteles...</div>;

    // Filtramos localmente para secciones específicas (o puedes crear endpoints específicos en el backend)
    const recientes = productos.slice(0, 4); 
    const destacados = productos.filter(p => p.precio > 8000).slice(0, 4); 

    return (
        <div>
            <Destacadas/>
            <ProductosGrid
                title="Nuevos Productos" productos={recientes}
            />
            <ProductosGrid
                title="Productos destacados" productos={destacados}
            />
        </div>
    );
};