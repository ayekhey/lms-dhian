import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TeacherRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'TEACHER') return <Navigate to="/student/dashboard" />;

  return children;
}