import { useEffect, useState } from 'react';
import { UsuarioRegistrado } from '../types/auth';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<UsuarioRegistrado | null>(null);

  useEffect(() => {
    // Obtener los datos almacenados en localStorage
    const storedData = localStorage.getItem('auth');
    
    if (storedData) {
      try {
        // Intentar parsear los datos
        const parsedData = JSON.parse(storedData);

        // Verificar que los datos tengan la estructura esperada
        const user: UsuarioRegistrado = parsedData.user;

        console.log(user)
        const token = parsedData.token;

        // Si los datos son válidos, guardarlos en el estado
        if (user && token) {
          setProfileData(user);
        }
      } catch (error) {
        console.error("Error al parsear los datos de autenticación:", error);
      }
    }
  }, []);

  if (!profileData) {
    return <div className="text-center text-gray-500">Cargando...</div>;  // O mostrar un mensaje de error si no se encuentran los datos
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Perfil de Usuario</h1>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-medium text-gray-700 mb-4">Información del Usuario</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Nombre:</span>
              <span className="text-gray-500">{profileData.nombre} {profileData.apellido_paterno} {profileData.apellido_materno}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Usuario:</span>
              <span className="text-gray-500">{profileData.usuario}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Rol:</span>
              <span className="text-gray-500">{profileData.rol.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Estado:</span>
              <span className={`text-gray-500 ${profileData.enable ? 'text-green-500' : 'text-red-500'}`}>
                {profileData.enable ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Creado el:</span>
              <span className="text-gray-500">{new Date(profileData.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Actualizado el:</span>
              <span className="text-gray-500">{new Date(profileData.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
