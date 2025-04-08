import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}