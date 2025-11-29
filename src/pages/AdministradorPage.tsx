import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import { DashboardNav } from '../components/admin/DashboardNav';
import { ProductList } from '../components/admin/productos/ProductList';
import { UserList } from '../components/admin/usuarios/UserList';
import { useUser } from '../context/UserContext';

export const AdministradorPage = () => {
    const { user, isAuthenticated } = useUser();
    const [activeTab, setActiveTab] = useState<'productos' | 'usuarios'>('productos');

    // 🔒 PROTECCIÓN: Solo usuarios con isAdmin pueden acceder
    if (!isAuthenticated || !user?.isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Panel de Administracion
                        </h1>
                        <p className="text-gray-600">
                            Gestiona productos y usuarios de la pasteleria
                        </p>
                    </div>

                    {/* Navegacion del Dashboard */}
                    <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Contenido del Dashboard */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {activeTab === 'productos' ? (
                            <ProductList />
                        ) : (
                            <UserList />
                        )}
                    </div>
                </div>
            </div>
        </AdminProvider>
    );
};
