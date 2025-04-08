export interface Usuario {
    id: string;
    usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    enable: boolean;
    createdAt: string;
    updatedAt: string;
    rol: {
      id: string;
      nombre: string;
    };
  }
  
  export interface UsuariosResponse {
    current_page: number;
    data: Usuario[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  }
  
  export interface UsuarioOperationResponse {
    success?: boolean;
    error?: string;
    message?: string;
  }