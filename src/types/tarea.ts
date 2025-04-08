export interface Categoria {
  id: string;
  nombre: string;
}

export interface Usuario {
  id: string;
  nombre: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_vencimiento: string;
  prioridad: boolean;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
  categoria: Categoria;
  usuario: Usuario;
}

export interface TareaResponse {
  current_page: number;
  data: Tarea[];
  first_page_url: string;
  last_page: number;
  last_page_url: string;
  links: { label: string; url: string | null; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}


export interface CreateTareaData {
  titulo: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  prioridad?: boolean;
  categoria_id: string;
  usuario_id?:string;
}

export interface GetTareasParams {
  page?: number;
  size?: number;
  titulo?: string;
  estado?: string;
  prioridad?: boolean;
  categoria_id?: string;
  usuario_id: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}


export interface AppliedFilters  {
  page?: number;
  size?: number;
  titulo?: string;
  estado?: string;
  prioridad?: boolean;
  categoria_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
};


  