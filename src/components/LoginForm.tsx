import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, storeAuthData } from '../services/auth';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    usuario: '',
    password: ''
  });
  const [apiError, setApiError] = useState(''); // Nuevo estado para errores de API
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario escribe
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) setApiError(''); // Limpiar error de API al escribir
  };

  const validateFields = () => {
    const errors = {
      usuario: !formData.usuario ? 'El usuario es requerido' : '',
      password: !formData.password ? 'La contraseña es requerida' : ''
    };
    setFieldErrors(errors);
    return !errors.usuario && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(''); // Resetear error de API al enviar
    if (!validateFields()) return;

    setIsLoading(true);
    
    // Tu servicio auth ya maneja los errores de API
    const response = await login(formData.usuario, formData.password);
    
    if (response.status === "success") {
      storeAuthData(response.token, response.user);
      setIsSuccess(true);
      setTimeout(() => onLoginSuccess(), 1500);
    } else {
      // Mostrar el mensaje de error que viene de tu API
      setApiError(response.message || 'Error al iniciar sesión');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
            <p className="text-gray-600 mt-2">Ingresa a tu cuenta</p>
          </div>

          {isSuccess ? (
            <div className="p-4 mb-6 bg-green-100 text-green-700 rounded-lg text-center animate-fade-in">
              ¡Inicio de sesión exitoso!
            </div>
          ) : (
            <>
              {/* Mostrar error de API */}
              {apiError && (
                <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg text-center animate-fade-in">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    value={formData.usuario}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      fieldErrors.usuario ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Ingresa tu usuario"
                  />
                  {fieldErrors.usuario && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.usuario}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Ingresa tu contraseña"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  } flex justify-center items-center`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : 'Iniciar Sesión'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/registro')}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                Regístrate ahora
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}