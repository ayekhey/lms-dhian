import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ModuleListPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/modules')
      .then(res => setModules(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/student/dashboard')} className="text-xl font-bold text-gray-800">
          ← LMS
        </button>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Modules</h2>

        {modules.length === 0 ? (
          <p className="text-gray-500">No modules available yet.</p>
        ) : (
          <div className="space-y-4">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => navigate(`/student/modules/${module.id}`)}
                className="w-full bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">{module.title}</h3>
                {module.description && (
                  <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}