import axios from 'axios';
import { getAuthData } from './auth';
import { UsuarioOperationResponse, UsuariosResponse } from '../types/usuarios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

export const getUsuarios = async (
    page: number = 1,
    size: number = 5,
    filters: {
      usuario?: string;
      nombre?: string;
      apellido_paterno?: string;
      apellido_materno?: string;
      rol_id?: string;
    } = {}
  ): Promise<UsuariosResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
  
      // Agregar solo los filtros que tienen valor
      if (filters.usuario) params.append('usuario', filters.usuario);
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.apellido_paterno) params.append('apellido_paterno', filters.apellido_paterno);
      if (filters.apellido_materno) params.append('apellido_materno', filters.apellido_materno);
      if (filters.rol_id) params.append('rol_id', filters.rol_id);
  
      const response = await api.get<UsuariosResponse>(
        `/usuarios?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      throw error;
    }
  };

export const updateUsuario = async (
  id: string,
  data: {
    usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    rol_id: string;
  }
): Promise<UsuarioOperationResponse> => {
  try {
    const response = await api.put<UsuarioOperationResponse>(
      `/usuarios/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as { 
      isAxiosError?: boolean; 
      response?: { 
        data: { error?: string; message?: string } 
      } 
    };

    if (axiosError.isAxiosError && axiosError.response) {
      const errorData = axiosError.response.data;
      const errorMessage = 
        errorData.error || errorData.message || 'Error al actualizar usuario';
        
      throw new Error(errorMessage);
    }

    throw new Error('Error de conexión con el servidor');
  }
};

export const disableUsuario = async (
  id: string
): Promise<UsuarioOperationResponse> => {
  try {
    const response = await api.patch<UsuarioOperationResponse>(
      `/usuarios/${id}/disable`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as { 
      isAxiosError?: boolean; 
      response?: { 
        data: { error?: string; message?: string } 
      } 
    };
    
    if (axiosError.isAxiosError && axiosError.response) {
      const errorData = axiosError.response.data;
      const errorMessage = 
        errorData.error || errorData.message || 'Error al desactivar usuario';
      throw new Error(errorMessage);
    }
    
    throw new Error('Error de conexión con el servidor');
  }
};