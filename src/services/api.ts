import { getAuthData } from './auth';

export const api = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const { token } = getAuthData();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error('Error en la solicitud');
  }

  return response.json();
};