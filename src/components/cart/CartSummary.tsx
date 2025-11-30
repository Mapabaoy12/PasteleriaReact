import type { CartState } from "../../interfaces/cartInterface";
import { formatPrice } from "../../utils/formatters";
import { PromoCodeInput } from "./PromoCodeInput";
import { UserDiscountInfo } from "./UserDiscountInfo";
import { useUser } from "../../context/UserContext";
import { usePedidos } from "../../context/PedidosContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FEATURE_MESSAGES } from "../../constants/messages";
import api from "../../service/api"; // Importamos la instancia de Axios configurada

interface CartSummaryProps {
    cart: CartState;
    onApplyPromoCode: (code: string) => boolean;
    onRemovePromoCode: () => void;
}

export const CartSummary = ({ cart, onApplyPromoCode, onRemovePromoCode }: CartSummaryProps) => {
    const { user, isAuthenticated } = useUser();
    const { agregarPedido } = usePedidos(); // Mantenemos esto para actualizar el estado local si es necesario, aunque lo ideal es recargar desde backend
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const envio = 0; // Envio gratis 

    // Calcular descuento de usuario
    const userDiscount = user && user.descuentoPorcentaje > 0 
        ? Math.round(cart.subtotal * (user.descuentoPorcentaje / 100))
        : 0;

    // Total con descuentos de usuario y codigo promocional
    const totalConDescuentos = cart.total - userDiscount;

    const handleProcederPago = async () => {
        // 1. Verificar autenticación
        if (!isAuthenticated || !user?.id) { // Verificamos user.id para asegurar que tenemos el ID del backend
            alert("Debes iniciar sesión para realizar una compra");
            navigate("/login");
            return;
        }

        // 2. Verificar carrito vacío
        if (cart.items.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        setIsProcessing(true);

        try {
            // --- PASO A: Crear el carrito en el Backend ---
            // Llama a: POST /api/v1/carrito/crear/{usuarioId}
            // Esto devuelve un objeto CarritoDTO con su nuevo ID
            const crearCarritoResponse = await api.post(`/api/v1/carrito/crear/${user.id}`);
            const carritoId = crearCarritoResponse.data.id;
            
            console.log(`Carrito creado en backend con ID: ${carritoId}`);

            // --- PASO B: Enviar los items del frontend al backend ---
            // El backend requiere agregar los items uno por uno (o podrías crear un endpoint batch)
            // Usamos Promise.all para enviarlos en paralelo y que sea rápido
            const promesasDeItems = cart.items.map(item => {
                // Body esperado por ItemDTO en el backend
                const itemPayload = {
                    productoId: item.id,
                    cantidad: item.quantity,
                    precioUnitario: item.precio
                };
                // Llama a: POST /api/v1/carrito/agregar-item/{carritoId}/
                return api.post(`/api/v1/carrito/agregar-item/${carritoId}/`, itemPayload);
            });

            await Promise.all(promesasDeItems);
            console.log("Todos los items agregados al backend");

            // --- PASO C: Generar la Boleta ---
            // Llama a: POST /api/v1/boletas/generar/{carritoId}
            // Esto finaliza la compra en el backend
            const boletaResponse = await api.post(`/api/v1/boletas/generar/${carritoId}`);
            const boletaGenerada = boletaResponse.data;

            // --- PASO D: Finalización Exitosa ---
            
            // 1. Agregar al contexto local de pedidos (opcional, para que se vea inmediato sin recargar)
            // Nota: Idealmente aquí usarías los datos reales de 'boletaGenerada'
            agregarPedido({
                items: cart.items,
                subtotal: cart.subtotal,
                descuentoCodigo: cart.discount,
                descuentoUsuario: userDiscount,
                total: totalConDescuentos,
                codigoPromoAplicado: cart.promoCode?.code
            });

            // 2. Limpiar carrito local
            clearCart();

            // 3. Feedback al usuario
            alert(`¡Compra exitosa! 🎉\n\nSe ha generado la boleta N° ${boletaGenerada.id}.\nTotal pagado: ${formatPrice(totalConDescuentos)}`);

            // 4. Redirigir
            navigate("/account");

        } catch (error: any) {
            console.error("Error en el proceso de pago:", error);
            
            // Manejo básico de errores
            let mensajeError = "Hubo un problema al procesar tu compra.";
            if (error.response) {
                // El servidor respondió con un código de error
                mensajeError += ` (${error.response.data?.message || error.response.status})`;
            } else if (error.request) {
                // No hubo respuesta del servidor
                mensajeError += " No se pudo conectar con el servidor.";
            }
            
            alert(mensajeError);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 h-fit sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
            
            {user && user.descuentoPorcentaje > 0 && (
                <UserDiscountInfo 
                    descuentoPorcentaje={user.descuentoPorcentaje}
                    esMayorDe50={user.esMayorDe50}
                    tieneDescuentoFelices50={user.tieneDescuentoFelices50}
                />
            )}
            
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'})</span>
                    <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                </div>

                {cart.promoCode && cart.discount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600">Descuento codigo ({cart.promoCode.discount}%)</span>
                        <span className="font-medium text-green-600">-{formatPrice(cart.discount)}</span>
                    </div>
                )}

                {userDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-rose-600">Descuento usuario ({user!.descuentoPorcentaje}%)</span>
                        <span className="font-medium text-rose-600">-{formatPrice(userDiscount)}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envio</span>
                    <span className="font-medium text-green-600">
                        {envio === 0 ? 'Gratis' : formatPrice(envio)}
                    </span>
                </div>
                
                <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex justify-between">
                        <span className="font-semibold text-lg">Total</span>
                        <span className="font-bold text-lg text-rose-600">{formatPrice(totalConDescuentos)}</span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <PromoCodeInput
                    onApply={onApplyPromoCode}
                    onRemove={onRemovePromoCode}
                    currentPromoCode={cart.promoCode?.code || null}
                />
            </div>
            
            <button 
                onClick={handleProcederPago}
                disabled={isProcessing || cart.items.length === 0}
                className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                    </>
                ) : 'Proceder al pago'}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
                {FEATURE_MESSAGES.FREE_SHIPPING_ALL}
            </p>
        </div>
    );
};