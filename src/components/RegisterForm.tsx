import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { RegisterData } from '../types/auth';
import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../services/roles';

export default function RegisterForm() {

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const [formData, setFormData] = useState<RegisterData>({
    usuario: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    password: '',
    rol_id: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    usuario: '',
    nombre: '',
    apellido_paterno: '',
    password: '',
    confirmPassword: ''
  });
  
  const [apiResponse, setApiResponse] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar errores locales al escribir
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiResponse) setApiResponse(null);
  };


  const validateFields = () => {
    const errors = {
      usuario: !formData.usuario ? 'Usuario es requerido' : '',
      nombre: !formData.nombre ? 'Nombre es requerido' : '',
      apellido_paterno: !formData.apellido_paterno ? 'Apellido paterno es requerido' : '',
      password: !formData.password 
        ? 'Contraseña es requerida' 
        : formData.password.length < 6 
          ? 'La contraseña debe tener al menos 6 caracteres' 
          : '',
      confirmPassword: !confirmPassword
        ? 'Debes confirmar tu contraseña'
        : confirmPassword !== formData.password
          ? 'Las contraseñas no coinciden'
          : ''
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateFields()) return;
  
    setIsLoading(true);
    
    const response = await register(formData);
    
    if ('usuario' in response) {
      setApiResponse({
        type: 'success',
        message: response.message || '¡Registro exitoso!'
      });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setApiResponse({
        type: 'error',
        message: response.error
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">Completa el formulario para registrarte</p>
          </div>

          {apiResponse && (
            <div className={`p-4 mb-6 rounded-lg text-center ${
              apiResponse.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {apiResponse.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre*
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {fieldErrors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario*
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    fieldErrors.usuario ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {fieldErrors.usuario && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.usuario}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido Paterno*
                </label>
                <input
                  id="apellido_paterno"
                  name="apellido_paterno"
                  type="text"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    fieldErrors.apellido_paterno ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {fieldErrors.apellido_paterno && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.apellido_paterno}</p>
                )}
              </div>

              <div>
                <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido Materno
                </label>
                <input
                  id="apellido_materno"
                  name="apellido_materno"
                  type="text"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rol_id" className="block text-sm font-medium text-gray-700 mb-1">
                Rol*
              </label>
              <select
                id="rol_id"
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona un rol</option>
                {roles?.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña*
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña*
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <input
              type="hidden"
              name="rol_id"
              value={formData.rol_id}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}