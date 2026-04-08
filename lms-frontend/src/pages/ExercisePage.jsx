import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ExercisePage() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  if (timeLeft === null || timeLeft <= 0) {
    if (timeLeft === 0 && selected && !result) {
      handleSubmit();
    }
    return;
  }
  const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
  return () => clearInterval(timer);
}, [timeLeft]);

  const startExercise = (exercise) => {
    setSelected(exercise);
    setAnswers({});
    setResult(null);
    if (exercise.timerMinutes) {
      setTimeLeft(exercise.timerMinutes * 60);
    }
  };

  const handleAnswer = (index, optionIndex) => {
    setAnswers(prev => ({ ...prev, [index]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/exercises/${selected.id}/submit`, { answers });
      setResult(res.data);
    } catch (err) {
      alert('Submission failed');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => { setSelected(null); navigate('/student/dashboard'); }} className="text-xl font-bold text-gray-800">
          ← LMS
        </button>
        {timeLeft !== null && timeLeft > 0 && (
          <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </nav>

      <div className="max-w-3xl mx-auto p-8">
        {!selected ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Exercises</h2>
            {exercises.length === 0 ? (
              <p className="text-gray-500">No exercises available yet.</p>
            ) : (
              <div className="space-y-4">
                {exercises.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => startExercise(ex)}
                    className="w-full bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{ex.title}</h3>
                    {ex.timerMinutes && (
                      <p className="text-sm text-gray-500 mt-1">⏱ {ex.timerMinutes} minutes</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : result ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Result</h2>
            <p className="text-5xl font-bold text-blue-600 mb-2">{result.score}/{result.total}</p>
            <p className="text-gray-500 mb-6">
              {result.score === result.total ? '🎉 Perfect score!' : 'Keep practicing!'}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Exercises
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{selected.title}</h2>
            <div className="space-y-6">
              {selected.questions.map((q, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <p className="font-medium text-gray-800 mb-3">{i + 1}. {q.questionText}</p>
                  <div className="space-y-2">
                    {q.options.map((option, j) => (
                      <button
                        key={j}
                        onClick={() => handleAnswer(i, j)}
                        className={`w-full text-left px-4 py-2 rounded border text-sm transition
                          ${answers[i] === j
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
              onClick={handleSubmit}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
            >
              Submit Exercise
            </button>
          </>
        )}
      </div>
    </div>
  );
}