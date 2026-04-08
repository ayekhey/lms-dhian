import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherModulePage() {
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [pageContent, setPageContent] = useState('');
  const [pageExtend, setPageExtend] = useState('');
  const [pageHelp, setPageHelp] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = () => {
    api.get('/modules')
      .then(res => setModules(res.data))
      .finally(() => setLoading(false));
  };

  const handleCreateModule = async () => {
    if (!title) return alert('Title is required');
    await api.post('/modules', { title, description });
    setTitle('');
    setDescription('');
    fetchModules();
  };

  const handleDeleteModule = async (id) => {
    if (!confirm('Delete this module?')) return;
    await api.delete(`/modules/${id}`);
    fetchModules();
  };

  const handleAddPage = async () => {
    if (!pageContent) return alert('Page content is required');
    await api.post(`/modules/${selectedModule.id}/pages`, {
      pageNumber: 1,
      content: pageContent,
      extendContent: pageExtend || null,
      helpContent: pageHelp || null
    });
    setPageContent('');
    setPageExtend('');
    setPageHelp('');
    alert('Page added successfully');
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

        {/* Create Module */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Module</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Module title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={2}
            />
            <button
              onClick={handleCreateModule}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Create Module
            </button>
          </div>
        </div>

        {/* Module List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Modules</h2>
          {modules.length === 0 ? (
            <p className="text-gray-500 text-sm">No modules yet.</p>
          ) : (
            <div className="space-y-3">
              {modules.map(module => (
                <div key={module.id} className="flex justify-between items-center border rounded p-3">
                  <span className="font-medium text-gray-800">{module.title}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    >
                      Add Page
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Page Form */}
        {selectedModule && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Add Page to: {selectedModule.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Extend and Help content are optional.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Content (all students)
                </label>
                <textarea
                  value={pageContent}
                  onChange={e => setPageContent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Main content visible to all students"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extend Content (Tier 2 & 3)
                </label>
                <textarea
                  value={pageExtend}
                  onChange={e => setPageExtend(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Additional content for intermediate and foundation students"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Content (Tier 3 only)
                </label>
                <textarea
                  value={pageHelp}
                  onChange={e => setPageHelp(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Step-by-step guidance for foundation students"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPage}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Add Page
                </button>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}