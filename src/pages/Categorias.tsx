import { useState } from "react";
import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategoria, getCategorias, updateCategoria, disableCategoria } from "../services/categoria";
import { CategoriasResponse, CreateCategoriaParams } from "../types/categoria";
import { FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

// Add this type for error responses
type ErrorResponse = {
  error?: string;
  message?: string;
};

const CategoriasTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [currentCategoriaId, setCurrentCategoriaId] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const queryClient = useQueryClient();

  // Obtener categorías
  const { data: categoriasResponse, isLoading } = useQuery<
    CategoriasResponse,
    Error,
    CategoriasResponse,
    QueryKey
  >({
    queryKey: ['categorias', currentPage, pageSize, searchTerm],
    queryFn: () => getCategorias(currentPage, pageSize, searchTerm),
  });

  // Crear categoría
  const { mutate: createMutate, isPending: isCreatePending } = useMutation({
    mutationFn: ({ nombre }: CreateCategoriaParams) => createCategoria(nombre),
    onSuccess: () => {
      setError(""); // limpia el error
      setNombre(""); // limpia el input
      setIsModalOpen(false); // SOLO en success
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setCurrentPage(1);
      console.log('success categoria')
    },
    onError: (error: unknown) => {
      console.log('error al crear categoria modal:',error)
      const message = getErrorMessage(error);
      setError(message);
    },
  });
  

  // Editar categoría
  const { mutate: editMutate, isPending: isEditPending, error: editError } = useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) => updateCategoria(id, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setIsEditModalOpen(false);
      setEditNombre("");
      setError("");
    },
  });

  // Eliminar categoría
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: (id: string) => disableCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setIsDeleteModalOpen(false);
      // Reset to first page if we deleted the last item on the current page
      if (categoriasResponse?.data.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError("");
    createMutate({ nombre });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError("");
    editMutate({ id: currentCategoriaId, nombre: editNombre });
  };

  const handleEditClick = (categoria: { id: string; nombre: string }) => {
    setCurrentCategoriaId(categoria.id);
    setEditNombre(categoria.nombre);
    setIsEditModalOpen(true);
    setError("");
  };

  const handleDeleteClick = (categoria: { id: string; nombre: string }) => {
    setCurrentCategoriaId(categoria.id);
    setEditNombre(categoria.nombre);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Helper function to get error message
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      const err = error as ErrorResponse;
      return err.error || err.message || 'Error desconocido';
    }
    return 'Error desconocido';
  };

  // Generate pagination range
  const getPaginationRange = () => {
    if (!categoriasResponse) return [];
    
    const totalPages = categoriasResponse.last_page;
    const current = currentPage;
    const delta = 2;
    const range = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }
    
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }
    
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    
    return range;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header y botón */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Categorías</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus className="text-lg" />
          Nueva Categoría
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por nombre..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Mostrar:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla responsive */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : categoriasResponse?.data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  No hay categorías disponibles
                </td>
              </tr>
            ) : (
              categoriasResponse?.data.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {categoria.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(categoria)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="Editar"
                      >
                        <FiEdit2 className="text-lg" />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(categoria)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <FiTrash2 className="text-lg" />
                        <span className="sr-only">Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {categoriasResponse && categoriasResponse.last_page  && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{categoriasResponse.from}</span> a{' '}
            <span className="font-medium">{categoriasResponse.to}</span> de{' '}
            <span className="font-medium">{categoriasResponse.total}</span> categorías
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            
            {getPaginationRange().map((page, index) => (
              page === '...' ? (
                <span key={index} className="px-2">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === categoriasResponse.last_page || isLoading}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Nueva Categoría</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la categoría"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
              />
              
              {editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {getErrorMessage(editError)}
                </div>
              )}

              {/* Mostrar error de validación */}
              {error && !editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(""); // opcional limpiar error al cerrar
                    setNombre(""); // opcional limpiar nombre
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatePending}
                  className={`px-4 py-2 rounded text-white ${
                    isCreatePending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isCreatePending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para editar categoría */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Editar Categoría</h2>
              
              {/* Mostrar error del servidor */}
              {editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {getErrorMessage(editError)}
                </div>
              )}

              {/* Mostrar error de validación */}
              {error && !editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Electrónica"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isEditPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center gap-2"
                  >
                    {isEditPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar categoría */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Eliminar Categoría</h2>
              <p className="mb-6">¿Estás seguro que deseas eliminar la categoría <strong>{editNombre}</strong>? Esta acción no se puede deshacer.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMutate(currentCategoriaId)}
                  disabled={isDeletePending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition flex items-center gap-2"
                >
                  {isDeletePending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasTable;