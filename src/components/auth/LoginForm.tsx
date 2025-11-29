// src/components/auth/LoginForm.tsx (VERSIÓN CORREGIDA)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { InputField } from "./InputField";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { ForgotPasswordLink } from "./ForgotPasswordLink";
import { AuthService } from "../../service/auth.service";
import { useUser } from '../../context/UserContext';
import { jwtDecode } from "jwt-decode"; 

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { login } = useUser(); // Tu función del contexto

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Login con Backend (Obtener Token)
            const token = await AuthService.login(formData.email, formData.password);
            localStorage.setItem('token', token);

            // 2. Decodificar el token para leer los datos reales (Rol y Email)
            // 'any' se usa aquí porque la estructura del token depende de tu backend
            const decoded: any = jwtDecode(token);
            
            // 3. Configurar el usuario para el contexto de React
            const usuarioLogueado = {
                email: decoded.sub, // 'sub' es el estándar para el username/email en JWT
                nombre: decoded.sub.split('@')[0], 
                // AQUI validamos si el token dice que es admin
                // Asegúrate que en tu Backend (JwtService.java) la clave sea "rol" o "role"
                isAdmin: decoded.rol === 'Administrador' || decoded.role === 'Administrador', 
                esDuocUC: false,
                // Datos por defecto para evitar errores en componentes que esperen estos campos
                telefono: "",
                fechaNacimiento: "2000-01-01",
                direccion: "",
                esMayorDe50: false,
                tieneDescuentoFelices50: false,
                descuentoPorcentaje: 0,
                tortaGratisCumpleanosDisponible: false,
                tortaGratisCumpleanosUsada: false,
            };

            // 4. Actualizar estado global
            login(usuarioLogueado);
            
            alert(`Bienvenido ${usuarioLogueado.isAdmin ? 'Administrador' : 'Cliente'} 🔓`);
            
            // 5. Redirección inteligente
            if (usuarioLogueado.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/account");
            }

        } catch (error) {
            console.error("Error de login:", error);
            alert("Error al iniciar sesión: Credenciales inválidas o servidor no disponible.");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    label="Correo electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@ejemplo.com"
                    icon={HiMail}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={HiLockClosed}
                />
                <div className="flex items-center justify-between">
                    <RememberMeCheckbox />
                    <ForgotPasswordLink />
                </div>
                <button
                    type="submit"
                    className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition-colors font-medium"
                >
                    Iniciar Sesión
                </button>
            </form>
            {/* Footer del form... */}
        </div>
    );
};