import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/diagnostic/questions'),
      api.get('/diagnostic/config')
    ]).then(([questionsRes, configRes]) => {
      setQuestions(questionsRes.data);
      if (configRes.data.timerMinutes) {
        setTimeLeft(configRes.data.timerMinutes * 60);
      }
    }).catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      await api.post('/diagnostic/submit', { answers });
      const token = localStorage.getItem('token');
      const meRes = await api.get('/auth/me');
      login(token, meRes.data);
      navigate('/student/dashboard');
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    handleSubmit();
  };

  if (loading) return <div className="p-8">Loading questions...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Diagnostic Test</h1>
          {timeLeft !== null && (
            <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Answer all questions to determine your learning tier.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="border rounded p-4">
              <p className="font-medium text-gray-800 mb-3">
                {index + 1}. {q.questionText}
              </p>
              <div className="space-y-2">
                {q.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, i)}
                    className={`w-full text-left px-4 py-2 rounded border text-sm transition
                      ${answers[q.id] === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleManualSubmit}
          disabled={submitting}
          className="mt-8 w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  );
}