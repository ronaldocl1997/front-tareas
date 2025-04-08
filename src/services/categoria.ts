import axios from 'axios';
import { getAuthData } from './auth'; // Importamos la función para obtener el token
import {
  CategoriasResponse,
  CategoriaOperationResponse,
  CategoriaErrorResponse
} from '../types/categoria';

// Configuración de axios con interceptors para el token
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir el token a cada solicitud
api.interceptors.request.use((config) => {
  const { token } = getAuthData();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getCategorias = async (
  page: number = 1,
  size: number = 10,
  nombre?: string
): Promise<CategoriasResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (nombre) params.append('nombre', nombre);

    const response = await api.get<CategoriasResponse>(
      `/categoria?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching categorias:', error);
    throw error;
  }
};

export const createCategoria = async (
  nombre: string
): Promise<CategoriaOperationResponse> => {
  try {
    const response = await api.post<CategoriaOperationResponse>('/categoria', { nombre });
    return response.data;  // Si todo va bien, devolvemos la respuesta
  } catch (error) {
    const axiosError = error as {
      isAxiosError?: boolean;
      response?: {
        data?: {
          error?: string;
        };
      };
    };

    const errorMessage =
      axiosError.response?.data?.error ?? 'Error al crear categoría';

    console.error('Error en crear categoría:', errorMessage);

    // Lanzar un error para que se detecte en el `onError` de `useMutation`
    throw new Error(errorMessage);
  }
};

export const updateCategoria = async (
  id: string,
  nombre: string
): Promise<CategoriaOperationResponse> => {
  try {
    const response = await api.put<CategoriaOperationResponse>(
      `/categoria/${id}`,
      { nombre }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as { 
      isAxiosError?: boolean; 
      response?: { 
        data: CategoriaErrorResponse | { error?: string; message?: string } 
      } 
    };

    if (axiosError.isAxiosError && axiosError.response) {
      const errorData = axiosError.response.data;
      const errorMessage = 
        ('error' in errorData && errorData.error) ? errorData.error : 
        ('message' in errorData && errorData.message) ? errorData.message : 
        'Error al actualizar categoría';
        
      // Lanzar un error con el mensaje adecuado para que el `onError` de `useMutation` lo maneje
      throw new Error(errorMessage);
    }

    // Si no es un error de Axios, lanzar un error general de conexión
    throw new Error('Error de conexión con el servidor');
  }
};

export const disableCategoria = async (
  id: string
): Promise<CategoriaOperationResponse> => {
  try {
    const response = await api.patch<CategoriaOperationResponse>(
      `/categoria/${id}/disable`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as { 
      isAxiosError?: boolean; 
      response?: { 
        data: CategoriaErrorResponse | { error?: string; message?: string } 
      } 
    };
    
    if (axiosError.isAxiosError && axiosError.response) {
      const errorData = axiosError.response.data;
      const errorMessage = ('error' in errorData && errorData.error) ? errorData.error : 
                         ('message' in errorData && errorData.message) ? errorData.message : 
                         'Error al desactivar categoría';
      return { error: errorMessage };
    }
    
    return { error: 'Error de conexión con el servidor' };
  }
};