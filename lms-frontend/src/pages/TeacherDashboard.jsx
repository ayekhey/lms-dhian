import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">LMS — Teacher</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/teacher/modules')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-800">Modules</h3>
            <p className="text-sm text-gray-500 mt-1">Upload and manage modules</p>
          </button>

          <button
            onClick={() => navigate('/teacher/media')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-gray-800">Media</h3>
            <p className="text-sm text-gray-500 mt-1">Upload and manage QR codes</p>
          </button>

          <button
            onClick={() => navigate('/teacher/exercises')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-lg font-semibold text-gray-800">Exercises</h3>
            <p className="text-sm text-gray-500 mt-1">Manage exercises and view results</p>
          </button>

          <button
            onClick={() => navigate('/teacher/diagnostic')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-800">Diagnostic</h3>
            <p className="text-sm text-gray-500 mt-1">Manage diagnostic questions</p>
          </button>

          <button
            onClick={() => navigate('/teacher/students')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
            >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-800">Students</h3>
            <p className="text-sm text-gray-500 mt-1">Manage student accounts</p>
            </button>

        </div>
      </div>
    </div>
  );
}