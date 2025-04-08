import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppliedFilters, GetTareasParams, Tarea, TareaResponse } from '../types/tarea';
import { getTareas, updateTarea } from '../services/tareas';
import { forwardRef, useRef, useState } from 'react';
import CreateTareaModal from '../components/CreateTareaModel';
import { getCategorias } from '../services/categoria';
import { CategoriasResponse } from '../types/categoria';
import { getAuthData } from '../services/auth';
import { FiFilter, FiX } from 'react-icons/fi';

const ItemTypes = {
  TAREA: 'tarea',
};

type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada';

const estadoLabels: Record<EstadoTarea, { label: string; color: string }> = {
  pendiente: { label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800' },
  en_progreso: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  completada: { label: 'Completadas', color: 'bg-green-100 text-green-800' },
};

interface TareaCardProps {
  tarea: Tarea;
}

const TareaCard = ({ tarea }: TareaCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TAREA,
    item: { id: tarea.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref); // Aplica la ref al drag

  return (
    <div
      ref={ref}
      className={`p-4 mb-3 rounded-lg shadow-sm border border-gray-200 bg-white cursor-move transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{tarea.titulo}</h3>
        {tarea.prioridad && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Prioridad
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1">{tarea.descripcion}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
        </span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {tarea.categoria.nombre}
        </span>
      </div>
    </div>
  );
};

interface EstadoColumnProps {
  estado: EstadoTarea;
  tareas: Tarea[];
  onDrop: (id: string) => void;
}

const EstadoColumn = forwardRef<HTMLDivElement, EstadoColumnProps>(
  ({ estado, tareas, onDrop }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.TAREA,
      drop: (item: { id: string }) => onDrop(item.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    drop(localRef);

    // Vincula la ref interna con la ref externa
    const setRefs = (node: HTMLDivElement) => {
      localRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const { label, color } = estadoLabels[estado];

    return (
      <div
        ref={setRefs}
        className={`flex-1 p-4 rounded-lg shadow-sm border transition-colors ${
          isOver ? 'border-dashed border-blue-500' : 'border-gray-200'
        }`}
      >
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${color}`}>
          {label} ({tareas.length})
        </div>
        <div className="space-y-3">
          {tareas.map((tarea) => (
            <TareaCard key={tarea.id} tarea={tarea} />
          ))}
        </div>
      </div>
    );
  }
);
const TableroTareas = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = getAuthData();
  
  // Estado para los filtros
  const [formFilters, setFormFilters] = useState<Omit<GetTareasParams, 'usuario_id'>>({
    titulo: '',
    estado: '',
    prioridad: undefined,
    categoria_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
  });

  const applyFilters = () => {
    // Crear objeto con tipo explícito
    const filtersToApply: AppliedFilters = { page: 1 }; // Siempre resetear a página 1
    
    if (formFilters.size) filtersToApply.size = formFilters.size;
    if (formFilters.titulo) filtersToApply.titulo = formFilters.titulo;
    if (formFilters.estado) filtersToApply.estado = formFilters.estado;
    if (formFilters.prioridad !== undefined) filtersToApply.prioridad = formFilters.prioridad;
    if (formFilters.categoria_id) filtersToApply.categoria_id = formFilters.categoria_id;
    if (formFilters.fecha_desde) filtersToApply.fecha_desde = formFilters.fecha_desde;
    if (formFilters.fecha_hasta) filtersToApply.fecha_hasta = formFilters.fecha_hasta;
  
    setAppliedFilters(filtersToApply);
  };


  const queryClient = useQueryClient();
  const pendientesRef = useRef<HTMLDivElement>(null);
  const enProgresoRef = useRef<HTMLDivElement>(null);
  const completadasRef = useRef<HTMLDivElement>(null);

    // Query que usa solo los filtros aplicados
    const { data: tareasResponse, isLoading, isError, error } = useQuery<TareaResponse, Error>({
      queryKey: ['tareas', appliedFilters, user?.id],
      queryFn: () => getTareas({
        ...appliedFilters,
        usuario_id: user?.id || ''
      }),
    });


  const { data: categorias } = useQuery<CategoriasResponse>({
    queryKey: ['categorias'],
    queryFn: () => getCategorias(),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormFilters(prev => ({
      ...prev,
      [name]: val
    }));
  };
  

  const resetFilters = () => {
    setFormFilters({
      titulo: '',
      estado: '',
      prioridad: undefined,
      categoria_id: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    // Opcional: también limpiar los filtros aplicados
    setAppliedFilters({
    });
  };


  const { mutate: updateTareaEstado } = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTarea }) =>
      updateTarea(id, { estado }),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['tareas'] });

      const previousTareas = queryClient.getQueryData<TareaResponse>(['tareas']);

      if (previousTareas) {
        queryClient.setQueryData<TareaResponse>(['tareas'], (old) => ({
          ...old!,
          data: old!.data.map((t) =>
            t.id === id ? { ...t, estado } : t
          ),
        }));
      }

      return { previousTareas };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTareas) {
        queryClient.setQueryData(['tareas'], context.previousTareas);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas'] });
    },
  });

  if (isLoading) return <div>Cargando tareas...</div>;
  if (isError) return <div>Error: {error?.message || 'Error al cargar tareas'}</div>;

  const tareasPorEstado = (estado: EstadoTarea): Tarea[] =>
    tareasResponse?.data.filter((t) => t.estado === estado) || [];

  const handleDrop = (id: string, nuevoEstado: EstadoTarea) => {
    updateTareaEstado({ id, estado: nuevoEstado });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tablero de Tareas</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              <FiFilter />
              Filtros
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Nueva Tarea
            </button>
          </div>
        </div>

         {/* Panel de Filtros */}
         {isFilterOpen && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtrar Tareas</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FiX />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campos del formulario iguales pero usando formFilters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formFilters.titulo}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoria_id"
                  value={formFilters.categoria_id}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Todas las categorías</option>
                  {categorias?.data.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {/* ... otros campos iguales pero usando formFilters ... */}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={resetFilters}
                type="button"
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                Limpiar filtros
              </button>
              <button
                onClick={applyFilters}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Buscar
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EstadoColumn
            ref={pendientesRef}
            estado="pendiente"
            tareas={tareasPorEstado('pendiente')}
            onDrop={(id) => handleDrop(id, 'pendiente')}
          />
          <EstadoColumn
            ref={enProgresoRef}
            estado="en_progreso"
            tareas={tareasPorEstado('en_progreso')}
            onDrop={(id) => handleDrop(id, 'en_progreso')}
          />
          <EstadoColumn
            ref={completadasRef}
            estado="completada"
            tareas={tareasPorEstado('completada')}
            onDrop={(id) => handleDrop(id, 'completada')}
          />
        </div>

        
        {isModalOpen && categorias && (
          <CreateTareaModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            categorias={categorias.data} // Asegúrate de que esto coincida con la estructura de tu API
          />
        )}
      </div>
    </DndProvider>
  );
};

export default TableroTareas;
