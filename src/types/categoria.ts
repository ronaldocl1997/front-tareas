export interface Categoria {
  id: string;
  nombre: string;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoriasResponse {
  current_page: number;
  data: Categoria[];
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

export interface CreateCategoriaParams {
  nombre: string;
}
  
  export interface CategoriaCreateResponse {
    message: string;
    categoria: Categoria;
  }
  
  export interface CategoriaErrorResponse {
    error: string;
    message?: string;  // Hacer message opcional si es necesario
  }
  
  export type CategoriaOperationResponse = CategoriaCreateResponse | CategoriaErrorResponse;