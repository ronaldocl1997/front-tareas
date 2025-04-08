import { useState } from "react";
import {  useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Usuario, UsuariosResponse } from "../types/usuarios";
import { disableUsuario, getUsuarios, updateUsuario } from "../services/usuario";
import { getRoles } from "../services/roles";

type ErrorResponse = {
  error?: string;
  message?: string;
};

type Rol = {
  id: number;
  nombre: string;
};

const UsuariosTable = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState({
    id: "",
    usuario: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    rol_id: ""
  });
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const queryClient = useQueryClient();

  const [tempFilters, setTempFilters] = useState({
    usuario: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol_id: ''
  });
  
  const [appliedFilters, setAppliedFilters] = useState({
    usuario: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol_id: ''
  });

   // Obtener roles
   const { data: roles } = useQuery<Rol[]>({
    queryKey: ['roles'],
    queryFn: getRoles,
  });


  const { data: usuariosResponse, isLoading } = useQuery<
  UsuariosResponse,
  Error,
  UsuariosResponse,
  ['usuarios', number, number, typeof appliedFilters]
  >({
    queryKey: ['usuarios', currentPage, pageSize, appliedFilters],
    queryFn: () => getUsuarios(currentPage, pageSize, appliedFilters),
  });

  console.log('response usuario=',usuariosResponse);
  // Editar usuario
  const { mutate: editMutate, isPending: isEditPending, error: editError } = useMutation({
    mutationFn: (data: {
      id: string;
      usuario: string;
      nombre: string;
      apellido_paterno: string;
      apellido_materno: string;
      rol_id: string;
    }) => updateUsuario(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsEditModalOpen(false);
      setError("");
    },
  });

  // Eliminar usuario
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: (id: string) => disableUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsDeleteModalOpen(false);
      if (usuariosResponse?.data.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUsuario.usuario.trim() || !currentUsuario.nombre.trim() || !currentUsuario.apellido_paterno.trim()) {
      setError("Usuario, nombre y apellido paterno son obligatorios");
      return;
    }
    setError("");
    editMutate(currentUsuario);
  };

  const handleEditClick = (usuario: Usuario) => {
    setCurrentUsuario({
      id: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno || "",
      rol_id: usuario.rol.id
    });
    setIsEditModalOpen(true);
    setError("");
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setCurrentUsuario({
      id: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno || "",
      rol_id: usuario.rol.id
    });
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      const err = error as ErrorResponse;
      return err.error || err.message || 'Error desconocido';
    }
    return 'Error desconocido';
  };

  const getPaginationRange = () => {
    if (!usuariosResponse) return [];

    const totalPages = usuariosResponse.last_page;
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Usuarios</h1>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <form 
         onSubmit={(e) => {
          e.preventDefault();
          setAppliedFilters(tempFilters);
          setCurrentPage(1); // Resetear a la primera página al aplicar nuevos filtros
        }} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Campo de usuario */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            value={tempFilters.usuario}
            onChange={(e) => setTempFilters({...tempFilters, usuario: e.target.value})}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por usuario"
          />
        </div>

        {/* Campo de nombre */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={tempFilters.nombre}
            onChange={(e) => setTempFilters({...tempFilters, nombre: e.target.value})}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por nombre"
          />
        </div>

        {/* Campo de apellido paterno */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Apellido Paterno</label>
          <input
            type="text"
            value={tempFilters.apellido_paterno}
            onChange={(e) => setTempFilters({...tempFilters, apellido_paterno: e.target.value})}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por apellido paterno"
          />
        </div>

        {/* Campo de apellido materno */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Apellido Materno</label>
          <input
            type="text"
            value={tempFilters.apellido_materno}
            onChange={(e) => setTempFilters({...tempFilters, apellido_materno: e.target.value})}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por apellido materno"
          />
        </div>

        {/* Campo de rol */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Rol</label>
          <select
            value={tempFilters.rol_id}
            onChange={(e) => setTempFilters({...tempFilters, rol_id: e.target.value})}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            {roles?.map((rol) => (
              <option key={rol.id} value={rol.id.toString()}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>


        {/* Controles de paginación y botones */}
        <div className="flex flex-col justify-end space-y-2 md:flex-row md:items-end md:space-y-0 md:space-x-2 lg:col-span-3">
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
          </div>
          
          <button
            type="button"
            onClick={() => {
              // Resetear filtros
              setTempFilters({
                usuario: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                rol_id: ''
              });
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Limpiar
          </button>
          
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Usuario</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Apellidos</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rol</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : usuariosResponse?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios disponibles
                </td>
              </tr>
            ) : (
              usuariosResponse?.data.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {usuario.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {usuario.apellido_paterno} {usuario.apellido_materno || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {usuario.rol.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(usuario)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="Editar"
                      >
                        <FiEdit2 className="text-lg" />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(usuario)}
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
      {usuariosResponse && usuariosResponse.last_page && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{usuariosResponse.from}</span> a{' '}
            <span className="font-medium">{usuariosResponse.to}</span> de{' '}
            <span className="font-medium">{usuariosResponse.total}</span> usuarios
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
              disabled={currentPage === usuariosResponse.last_page || isLoading}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
              
              {editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {getErrorMessage(editError)}
                </div>
              )}

              {error && !editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={currentUsuario.usuario}
                    onChange={(e) => setCurrentUsuario({...currentUsuario, usuario: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={currentUsuario.nombre}
                    onChange={(e) => setCurrentUsuario({...currentUsuario, nombre: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    value={currentUsuario.apellido_paterno}
                    onChange={(e) => setCurrentUsuario({...currentUsuario, apellido_paterno: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={currentUsuario.apellido_materno}
                    onChange={(e) => setCurrentUsuario({...currentUsuario, apellido_materno: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    value={currentUsuario.rol_id}
                    onChange={(e) => setCurrentUsuario({...currentUsuario, rol_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7ac8014d-97fc-4ffa-8539-4ce8522aa8e1">Usuario</option>
                    <option value="2cb7cf8e-9086-44d0-9272-4ed9c1d42dff">Admin</option>
                  </select>
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

      {/* Modal para eliminar usuario */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Eliminar Usuario</h2>
              <p className="mb-6">¿Estás seguro que deseas eliminar al usuario <strong>{currentUsuario.usuario}</strong>? Esta acción no se puede deshacer.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMutate(currentUsuario.id)}
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

export default UsuariosTable;