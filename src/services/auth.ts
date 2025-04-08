import axios from 'axios';
import { LoginResponse, RegisterData, RegisterErrorResponse, RegisterResponse, RegisterSuccessResponse, User } from '../types/auth';

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const login = async (usuario: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/login', { usuario, password });
    return response.data;
    
  } catch (error) {
    // Verificación manual del tipo de error

    const axiosError = error as { isAxiosError?: boolean; response?: { data: LoginResponse } };
    
    if (axiosError.isAxiosError && axiosError.response) {
      console.log('Error de la API:', axiosError.response.data);
      return axiosError.response.data;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.log('Error en login:', errorMessage);
    
    return {
      status: "error",
      message: "Error de conexión con el servidor"
    };
  }
};

// Las funciones de almacenamiento/localStorage pueden permanecer igual
export const storeAuthData = (token: string, user: User): void => {
  localStorage.setItem('auth', JSON.stringify({ token, user }));
};

export const clearAuthData = (): void => {
  localStorage.removeItem('auth');
};

export const getAuthData = (): { token: string | null; user: User | null } => {
  const authData = localStorage.getItem('auth');
  return authData ? JSON.parse(authData) : { token: null, user: null };
};


export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterSuccessResponse>('/usuarios', userData);
    return response.data;
  } catch (error) {
    const axiosError = error as { 
      isAxiosError?: boolean; 
      response?: { 
        data: RegisterErrorResponse | { error?: string; message?: string } 
      } 
    };
    
    if (axiosError.isAxiosError && axiosError.response) {
      // Maneja diferentes formatos de error de manera segura
      const errorData = axiosError.response.data;
      
      // Extracción segura del mensaje de error
      let errorMessage = 'Error en el registro';
      
      if ('error' in errorData) {
        errorMessage = errorData.error || errorMessage;
      } else if ('message' in errorData) {
        errorMessage = errorData.message || errorMessage;
      }
      
      console.log('Error de la API:', errorData);
      return { error: errorMessage };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.log('Error en registro:', errorMessage);
    
    return { error: "Error de conexión con el servidor" };
  }
};