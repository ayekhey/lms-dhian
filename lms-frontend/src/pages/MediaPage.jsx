import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/media')
      .then(res => setMedia(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/student/dashboard')} className="text-xl font-bold text-gray-800">
          ← LMS
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Media</h2>

        {media.length === 0 ? (
          <p className="text-gray-500">No media available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {media.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 text-center">
                <img
                  src={`http://localhost:3001${item.imageUrl}`}
                  alt={item.label || 'QR Code'}
                  className="w-40 h-40 object-contain mx-auto"
                />
                {item.label && (
                  <p className="mt-2 text-sm font-medium text-gray-700">{item.label}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}