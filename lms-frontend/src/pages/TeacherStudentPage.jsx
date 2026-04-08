import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherStudentPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    api.get('/users/students')
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreate = async () => {
    if (!name || !email || !password) return alert('All fields are required');
    try {
      await api.post('/users/students', { name, email, password });
      setName('');
      setEmail('');
      setPassword('');
      fetchStudents();
      showMessage('Student account created successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleResetPassword = async (id) => {
    if (!newPassword) return alert('Enter a new password');
    await api.put(`/users/students/${id}/reset-password`, { password: newPassword });
    setResetPasswordId(null);
    setNewPassword('');
    showMessage('Password reset successfully');
  };

  const handleResetDiagnostic = async (id) => {
    if (!confirm('Reset this student\'s diagnostic? They will need to retake it.')) return;
    await api.put(`/users/students/${id}/reset-diagnostic`);
    fetchStudents();
    showMessage('Diagnostic reset successfully');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student account? This cannot be undone.')) return;
    await api.delete(`/users/students/${id}`);
    fetchStudents();
    showMessage('Student deleted');
  };

  const tierLabel = (tier) => {
    if (!tier) return { text: 'No tier', color: 'text-gray-400' };
    const map = {
      1: { text: 'Tier 1 — Advanced', color: 'text-green-600' },
      2: { text: 'Tier 2 — Intermediate', color: 'text-yellow-600' },
      3: { text: 'Tier 3 — Foundation', color: 'text-red-600' }
    };
    return map[tier];
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

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded text-sm">
            ✓ {message}
          </div>
        )}

        {/* Create Student */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create Student Account</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Initial password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Students ({students.length})
          </h2>

          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No students yet.</p>
          ) : (
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className={`text-xs mt-1 ${tierLabel(student.tier).color}`}>
                        {tierLabel(student.tier).text}
                        {' · '}
                        {student.diagnosticDone ? 'Diagnostic done' : 'Diagnostic pending'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => {
                          setResetPasswordId(student.id);
                          setNewPassword('');
                        }}
                        className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleResetDiagnostic(student.id)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        Reset Diagnostic
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Inline password reset form */}
                  {resetPasswordId === student.id && (
                    <div className="mt-3 flex gap-2 items-center">
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                      />
                      <button
                        onClick={() => handleResetPassword(student.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setResetPasswordId(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}