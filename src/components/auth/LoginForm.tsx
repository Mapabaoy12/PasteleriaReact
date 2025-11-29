// src/components/auth/LoginForm.tsx (VERSIÓN CORREGIDA)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { InputField } from "./InputField";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { ForgotPasswordLink } from "./ForgotPasswordLink";
import { AuthService } from "../../service/auth.service";
import { useUser } from '../../context/UserContext';
// jwt-decode es opcional pero recomendado para leer el rol del token
// import { jwtDecode } from "jwt-decode"; 

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
            // 1. Autenticación con Backend
            const token = await AuthService.login(formData.email, formData.password);
            
            // 2. Guardar Token
            localStorage.setItem('token', token);

            // 3. Decodificar usuario para el Contexto (Integración Visual)
            // Como tu backend devuelve solo el string del token, necesitamos
            // reconstruir el objeto de usuario para que React sepa que estás logueado.
            // NOTA: Para que esto sea 100% real, tu JWT debe traer el 'rol' o 'isAdmin'.
            const usuarioLogueado = {
                email: formData.email,
                nombre: formData.email.split('@')[0], // Nombre temporal basado en email
                telefono: "",
                fechaNacimiento: "2000-01-01", // Valor temporal
                direccion: "",
                esDuocUC: false,
                esMayorDe50: false,
                tieneDescuentoFelices50: false,
                descuentoPorcentaje: 0,
                tortaGratisCumpleanosDisponible: false,
                tortaGratisCumpleanosUsada: false,
                isAdmin: false
            };

            // Simulación básica: Si el email es el del admin, le damos permisos
            // (Idealmente esto viene del token decodificado)
            if (formData.email === 'administrador@admin.com') {
                usuarioLogueado.isAdmin = true;
                usuarioLogueado.nombre = "Administrador";
            }

            // 4. Actualizar estado global de React
            login(usuarioLogueado);
            
            alert("Sesión iniciada exitosamente 🔓");
            
            // 5. Redirección según rol
            if (usuarioLogueado.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/account");
            }

        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión: Credenciales inválidas o problema de conexión");
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