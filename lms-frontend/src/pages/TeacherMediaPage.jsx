import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherMediaPage() {
  const [media, setMedia] = useState([]);
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = () => {
    api.get('/media')
      .then(res => setMedia(res.data))
      .finally(() => setLoading(false));
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('image', file);
    if (label) formData.append('label', label);

    await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setFile(null);
    setLabel('');
    fetchMedia();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media?')) return;
    await api.delete(`/media/${id}`);
    fetchMedia();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/teacher/dashboard')} className="text-xl font-bold text-gray-800">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload QR Code</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Label (optional)"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
            <button
              onClick={handleUpload}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Uploaded Media</h2>
          {media.length === 0 ? (
            <p className="text-gray-500 text-sm">No media uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {media.map(item => (
                <div key={item.id} className="border rounded p-4 text-center">
                  <img
                    src={`http://localhost:3001${item.imageUrl}`}
                    alt={item.label || 'QR Code'}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                  {item.label && (
                    <p className="mt-2 text-sm text-gray-700">{item.label}</p>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}