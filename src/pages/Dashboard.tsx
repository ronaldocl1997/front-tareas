import { Link, Outlet, useLocation } from 'react-router-dom';
import { clearAuthData, getAuthData } from '../services/auth';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { User } from '../types/auth';


interface MenuItem {
  path: string;
  name: string;
  roles: ('admin' | 'usuario')[];
}

export default function Dashboard() {
  const { user } = getAuthData() as { user: User };
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = user?.rol?.nombre; 

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  // Verifica si la ruta está activa
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  // Opciones del menú con tipado
  const menuItems: MenuItem[] = [
    { path: '/dashboard/tareas', name: 'Tareas', roles: ['admin', 'usuario'] },
    { path: '/dashboard/usuarios', name: 'Usuarios', roles: ['admin'] },
    { path: '/dashboard/categorias', name: 'Categorías', roles: ['admin'] },
    { path: '/dashboard/profile', name: 'Perfil', roles: ['admin', 'usuario'] },
  ];

  // Filtrar opciones según el rol
  const filteredMenuItems = menuItems.filter((item) => 
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              {/* Logo y botón móvil */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <Link to="/dashboard/tareas" className="text-xl font-bold text-blue-600">
                  Examen
                </Link>
                
                {/* Botón menú móvil */}
                <button
                  type="button"
                  className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Abrir menú</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
              
              {/* Menú desktop (oculto en móviles) */}
              <div className="hidden md:flex md:space-x-4 md:ml-6">
                {filteredMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 ${
                      isActive(item.path.split('/')[2])
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Información usuario y logout */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-600">
                {user?.nombre} {user?.apellido_paterno}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil (mostrado cuando mobileMenuOpen es true) */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path.split('/')[2])
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-lg">
                        {user?.nombre?.charAt(0)}{user?.apellido_paterno?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.nombre} {user?.apellido_paterno}
                    </div>
                    <div className="text-sm text-gray-500">{user?.rol?.nombre}</div>
                  </div>
                </div>
                <div className="mt-3 px-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}