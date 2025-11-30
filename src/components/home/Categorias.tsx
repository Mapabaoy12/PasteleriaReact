import { useEffect, useState } from "react";
import { CategoryService, type Categoria as CategoriaType } from "../../service/category.service";

// Función auxiliar para asignar imágenes locales según el nombre de la categoría del backend.
// Como el backend no trae imagen, usamos las que ya tienes en 'public/img'
const obtenerImagenPorCategoria = (nombreCategoria: string): string => {
    const nombreNormalizado = nombreCategoria.toLowerCase();

    if (nombreNormalizado.includes('cuadrada')) {
        return '/img/cuadradas/tortacuadrada1.jpg';
    }
    // Por defecto o si es circular
    return '/img/circulares/tortacircular1.webp';
};

export const Categoria = () => {
    // 1. Estado para guardar las categorías que vienen del backend
    const [categorias, setCategorias] = useState<CategoriaType[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. useEffect para cargar los datos al montar el componente
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await CategoryService.listar();
                setCategorias(data);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Cargando categorías...</div>;
    }

    return (
        <div className="flex flex-col items-center gap-3 pt-16 pb-12">
            <h2 className="font-bold text-2xl">
                Categorias Disponibles
            </h2>
            <p className="w-2/3 text-center text-sm md:text-base">
                La PasteleriaMilSabores cuenta con tortas de diferentes tamaños y formas
            </p>

            {/* Si no hay categorías, mostramos un mensaje */}
            {categorias.length === 0 ? (
                <p className="text-gray-500 mt-4">No hay categorías disponibles en este momento.</p>
            ) : (
                <div className="grid grid-cols-3 gap-6 mt-8 items-center md:grid-cols-6">
                    {/* 3. Mapeamos las categorías dinámicas */}
                    {categorias.map((cat) => (
                        <div key={cat.id} className="flex flex-col items-center gap-2">
                            <img 
                                src={obtenerImagenPorCategoria(cat.nombre)} 
                                alt={cat.nombre} 
                                className="w-20 h-20 object-contain rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            />
                            <span className="text-xs font-medium text-center">{cat.nombre}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};