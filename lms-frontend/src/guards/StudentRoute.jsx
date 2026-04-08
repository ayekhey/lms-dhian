import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'STUDENT') return <Navigate to="/teacher/dashboard" />;
  if (!user.diagnosticDone) return <Navigate to="/diagnostic" />;

  return children;
}