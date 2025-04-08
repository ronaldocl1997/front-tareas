import { Rol } from "./rol";

interface User {
    id: string;
    usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    rol: Rol;
    enable: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }
  
  interface LoginSuccessResponse {
    status: "success";
    token: string;
    user: User;
    token_type: string;
    expires_in: number;
  }
  
  interface LoginErrorResponse {
    status: "error";
    message: string;
  }
  
  type LoginResponse = LoginSuccessResponse | LoginErrorResponse;
  
  declare global {
    interface AuthContextType {
      user: User | null;
      token: string | null;
      login: (usuario: string, password: string) => Promise<LoginResponse>;
      logout: () => void;
      isAuthenticated: boolean;
    }
  }


  export interface UsuarioRegistrado {
    id: string;
    usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    rol_id: string;
    enable: boolean;
    createdAt: string;
    updatedAt: string;
    rol:Rol;
  }
  
  export interface RegisterData {
    usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    password: string;
    rol_id: string; // UUID del rol
  }
  
  export interface RegisterSuccessResponse {
    message: string;
    usuario: UsuarioRegistrado;
  }
  
  export interface RegisterErrorResponse {
    error: string;
  }
  
  export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;