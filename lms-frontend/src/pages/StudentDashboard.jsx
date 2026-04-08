import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tierLabels = {
    1: { label: 'Advanced', color: 'bg-green-100 text-green-800' },
    2: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    3: { label: 'Foundation', color: 'bg-red-100 text-red-800' }
  };

  const tier = tierLabels[user?.tier] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">LMS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${tier.color}`}>
            Tier {user?.tier} — {tier.label}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Cards */}
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome back, {user?.name}!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/student/modules')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-800">Modules</h3>
            <p className="text-sm text-gray-500 mt-1">Browse and read learning modules</p>
          </button>

          <button
            onClick={() => navigate('/student/media')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-gray-800">Media</h3>
            <p className="text-sm text-gray-500 mt-1">Scan QR codes for extra resources</p>
          </button>

          <button
            onClick={() => navigate('/student/exercises')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-lg font-semibold text-gray-800">Exercises</h3>
            <p className="text-sm text-gray-500 mt-1">Complete assigned exercises</p>
          </button>
        </div>
      </div>
    </div>
  );
}