import { Link } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi";

export const EmptyCart = () => {
    return (
        <div className="text-center py-16 px-4">
            <HiShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Tu carrito esta vacio</h1>
            <p className="text-gray-600 mb-8">Agrega algunos productos deliciosos a tu carrito</p>
            <Link 
                to="/pasteles"
                className="inline-block bg-rose-500 text-white px-8 py-3 rounded-lg hover:bg-rose-600 transition-colors font-medium"
            >
                Ver Pasteles
            </Link>
        </div>
    );
};
