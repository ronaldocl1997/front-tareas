import axios from 'axios';
import { getAuthData } from "./auth";

type Rol = {
  id: number;
  nombre: string;
};

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

// Función de validación para asegurarnos que los datos sean un array de 'Rol'
const isRolArray = (data: unknown): data is Rol[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 'id' in item && 'nombre' in item
  );
};

export const getRoles = async (): Promise<Rol[]> => {
  try {
    const response = await api.get('/roles');
    if (isRolArray(response.data)) {
      return response.data; // Aquí TypeScript sabe que 'response.data' es un array de 'Rol'
    } else {
      throw new Error('Datos de roles no válidos');
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};
