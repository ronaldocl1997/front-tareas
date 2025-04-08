// services/tareas.ts
import axios from 'axios';
import { getAuthData } from './auth';
import { CreateTareaData, GetTareasParams, Tarea, TareaResponse } from '../types/tarea';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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

export const createTarea = async (tareaData: CreateTareaData) => {
  const response = await api.post('/tarea', tareaData, {
  });
  return response.data;
};

export const getTareas = async (params: GetTareasParams): Promise<TareaResponse> => {
  // Crear objeto filtrado
  const filteredParams: { [key: string]: string | number | boolean } = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      filteredParams[key] = value;
    }
  }

  try {
    const response = await api.get<TareaResponse>('/tarea', { 
      params: filteredParams 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tareas:', error);
    throw error;
  }
};
export const updateTarea = async (id: string, data: Partial<Tarea>) => {
  try {
    const response = await api.put(`/tarea/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tarea:', error);
    throw error;
  }
};