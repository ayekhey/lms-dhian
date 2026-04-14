import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function TeacherMediaPage() {
  const [media, setMedia] = useState([]);
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = () => {
    api.get('/media').then(res => setMedia(res.data)).finally(() => setLoading(false));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    if (label) formData.append('label', label);
    await api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFile(null);
    setLabel('');
    fetchMedia();
    showSuccess('QR code uploaded successfully');
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media?')) return;
    await api.delete(`/media/${id}`);
    fetchMedia();
    showSuccess('Media deleted');
  };

  return (
    <PageLayout title="Media" subtitle="Upload QR codes for students to scan.">
      <style>{css}</style>

      {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

      <div style={s.layout}>
        {/* Upload card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Upload QR Code</h2>

          <div style={s.fieldGroup}>
            <label style={s.label}>Label <span style={s.optional}>(optional)</span></label>
            <input
              className="lms-input"
              type="text"
              placeholder="e.g. Chapter 1 Resources"
              value={label}
              onChange={e => setLabel(e.target.value)}
              style={s.input}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>QR Code Image</label>
            <label style={s.fileLabel}>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={s.fileBtn}>
                <span style={{ fontSize: '20px' }}>📁</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                  {file ? file.name : 'Choose PNG or JPG file'}
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            style={{ ...s.btnPrimary, opacity: uploading || !file ? 0.6 : 1 }}
          >
            {uploading ? 'Uploading...' : '↑ Upload'}
          </button>
        </div>

        {/* Media grid */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Uploaded Media <span style={s.count}>({media.length})</span></h2>

          {loading ? (
            <p style={s.empty}>Loading...</p>
          ) : media.length === 0 ? (
            <div style={s.emptyState}>
              <span style={{ fontSize: '32px' }}>📱</span>
              <p style={s.emptyTitle}>No QR codes yet</p>
              <p style={s.emptySub}>Upload your first QR code on the left</p>
            </div>
          ) : (
            <div style={s.grid}>
              {media.map(item => (
                <div key={item.id} style={s.mediaCard}>
                  <img
                    src={`http://localhost:3001${item.imageUrl}`}
                    alt={item.label || 'QR Code'}
                    style={s.qrImg}
                  />
                  {item.label && <p style={s.mediaLabel}>{item.label}</p>}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={s.deleteBtn}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .lms-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
`;

const s = {
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' },
  layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', fontFamily: "'Inter', sans-serif" },
  count: { fontSize: '14px', fontWeight: 500, color: '#94a3b8' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  optional: { fontSize: '12px', fontWeight: 400, color: '#94a3b8' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  fileLabel: { cursor: 'pointer', display: 'block' },
  fileBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1.5px dashed #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc', transition: 'border-color 0.15s' },
  btnPrimary: { width: '100%', backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  empty: { color: '#94a3b8', fontSize: '14px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '40px 0', textAlign: 'center' },
  emptyTitle: { fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 },
  emptySub: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' },
  mediaCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  qrImg: { width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto', display: 'block' },
  mediaLabel: { fontSize: '12px', fontWeight: 600, color: '#374151', margin: '8px 0 8px', wordBreak: 'break-word' },
  deleteBtn: { fontSize: '11px', fontWeight: 600, color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
};