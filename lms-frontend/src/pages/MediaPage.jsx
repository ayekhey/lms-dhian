import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/media').then(res => setMedia(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout title="Media"><p style={{ color: '#6b7280' }}>Loading...</p></PageLayout>;

  return (
    <PageLayout title="Media" subtitle="Scan QR codes to access external resources.">
      {media.length === 0 ? (
        <div style={{ color: '#6b7280' }}>No media available yet.</div>
      ) : (
        <div style={s.grid}>
          {media.map(item => (
            <div key={item.id} style={s.card}>
              <img
                src={`http://localhost:3001${item.imageUrl}`}
                alt={item.label || 'QR Code'}
                style={s.img}
              />
              {item.label && <p style={s.label}>{item.label}</p>}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  img: {
    width: '140px',
    height: '140px',
    objectFit: 'contain',
    margin: '0 auto',
    display: 'block',
  },
  label: {
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
};