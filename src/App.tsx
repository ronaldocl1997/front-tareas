import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import RegisterForm from './components/RegisterForm';
import Tareas from './pages/Tareas';
import Usuarios from './pages/Usuarios';
import Categorias from './pages/Categorias';
import Roles from './pages/Roles';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tareas" replace />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="roles" element={<Roles />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;