import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherDiagnosticPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSaved, setTimerSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    api.get('/diagnostic/config').then(res => {
      if (res.data.timerMinutes) setTimerMinutes(String(res.data.timerMinutes));
    });
  }, []);

  const fetchQuestions = () => {
    api.get('/diagnostic/manage')
      .then(res => setQuestions(res.data))
      .finally(() => setLoading(false));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreate = async () => {
    if (!questionText) return alert('Question text is required');
    if (options.some(o => !o)) return alert('All options must be filled in');

    await api.post('/diagnostic/questions', {
      questionText,
      options,
      correctOption
    });

    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectOption(0);
    fetchQuestions();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/diagnostic/questions/${id}`);
    fetchQuestions();
  };

  const handleSaveTimer = async () => {
    await api.put('/diagnostic/config', {
      timerMinutes: timerMinutes ? parseInt(timerMinutes) : null
    });
    setTimerSaved(true);
    setTimeout(() => setTimerSaved(false), 2000);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="text-xl font-bold text-gray-800"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8 space-y-8">

        {/* Timer Setting */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Diagnostic Timer</h2>
          <p className="text-sm text-gray-500 mb-3">
            Set a time limit for the diagnostic test. Leave empty for no timer.
          </p>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              placeholder="Minutes (e.g. 10)"
              value={timerMinutes}
              onChange={e => setTimerMinutes(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-48"
            />
            <button
              onClick={handleSaveTimer}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Save Timer
            </button>
            {timerSaved && (
              <span className="text-green-600 text-sm">✓ Saved</span>
            )}
          </div>
        </div>

        {/* Create Question */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Add Diagnostic Question
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Question text"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctOption === i}
                  onChange={() => setCorrectOption(i)}
                />
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-gray-400">
              Select the radio button next to the correct answer
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Diagnostic Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <p className="text-gray-500 text-sm">No questions yet.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">
                      {index + 1}. {q.questionText}
                    </p>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-xs text-red-500 hover:text-red-700 ml-4"
                    >
                      Delete
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`text-sm px-2 py-1 rounded ${
                          i === q.correctOption
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {i === q.correctOption ? '✓ ' : ''}{opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}