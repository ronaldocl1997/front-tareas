import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTarea } from '../services/tareas';
import { getAuthData } from '../services/auth';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

interface CreateTareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: { id: string; nombre: string }[];
}

// Tipo para respuestas de error
type ErrorResponse = {
  error?: string;
  message?: string;
};

const CreateTareaModal = ({ isOpen, onClose, categorias }: CreateTareaModalProps) => {
  const queryClient = useQueryClient();
  const { user } = getAuthData();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_vencimiento: '',
    prioridad: false,
    categoria_id: '',
  });

  const [validationError, setValidationError] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: createTarea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
      onClose();
      resetForm();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.titulo.trim()) {
      setValidationError('El título es obligatorio');
      return;
    }
    
    if (!formData.categoria_id) {
      setValidationError('Debes seleccionar una categoría');
      return;
    }
    
    setValidationError('');
    mutate({
      ...formData,
      usuario_id: user?.id,
    });
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_vencimiento: '',
      prioridad: false,
      categoria_id: '',
    });
    setValidationError('');
  };

  // Función para obtener mensajes de error
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      const err = error as ErrorResponse;
      return err.error || err.message || 'Error al crear la tarea';
    }
    return 'Error al crear la tarea';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Nueva Tarea</h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Mensajes de error */}
        {(error || validationError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error ? getErrorMessage(error) : validationError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Campo Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Revisar informe mensual"
            />
          </div>

          {/* Campo Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Detalles de la tarea..."
            />
          </div>

          {/* Campo Fecha de vencimiento */}
          <div>
            <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              id="fecha_vencimiento"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campo Prioridad */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="prioridad"
              name="prioridad"
              checked={formData.prioridad}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="prioridad" className="ml-2 block text-sm text-gray-700">
              Marcar como prioridad alta
            </label>
          </div>

          {/* Campo Categoría */}
          <div>
            <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                isPending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition`}
            >
              {isPending ? (
                <>
                  <FiLoader className="animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FiSave />
                  Crear Tarea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTareaModal;