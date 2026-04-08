import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherExercisePage() {
  const [exercises, setExercises] = useState([]);
  const [title, setTitle] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOption: 0 }
  ]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = () => {
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .finally(() => setLoading(false));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleCreateExercise = async () => {
    if (!title) return alert('Title is required');
    await api.post('/exercises', {
      title,
      timerMinutes: timerMinutes ? parseInt(timerMinutes) : null,
      questions
    });
    setTitle('');
    setTimerMinutes('');
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    fetchExercises();
  };

  const viewResults = async (exercise) => {
    setSelectedExercise(exercise);
    const res = await api.get(`/exercises/${exercise.id}/results`);
    setResults(res.data);
  };

  const downloadCSV = () => {
    window.open(`http://localhost:3001/api/exercises/${selectedExercise.id}/results/export`, '_blank');
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

        {/* Create Exercise */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create Exercise</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Exercise title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Timer in minutes (optional)"
              value={timerMinutes}
              onChange={e => setTimerMinutes(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />

            {questions.map((q, i) => (
              <div key={i} className="border rounded p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Question {i + 1}</p>
                <input
                  type="text"
                  placeholder="Question text"
                  value={q.questionText}
                  onChange={e => handleQuestionChange(i, 'questionText', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                {q.options.map((opt, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctOption === j}
                      onChange={() => handleQuestionChange(i, 'correctOption', j)}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(i, j, e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={addQuestion}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300"
              >
                + Add Question
              </button>
              <button
                onClick={handleCreateExercise}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Create Exercise
              </button>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Exercises</h2>
          {exercises.length === 0 ? (
            <p className="text-gray-500 text-sm">No exercises yet.</p>
          ) : (
            <div className="space-y-3">
              {exercises.map(ex => (
                <div key={ex.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <span className="font-medium text-gray-800">{ex.title}</span>
                    {ex.timerMinutes && (
                      <span className="ml-2 text-xs text-gray-500">⏱ {ex.timerMinutes} min</span>
                    )}
                  </div>
                  <button
                    onClick={() => viewResults(ex)}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    View Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {selectedExercise && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Results: {selectedExercise.title}
              </h2>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Download CSV
              </button>
            </div>
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2">Student</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2">{r.student.name}</td>
                      <td className="py-2">{r.student.email}</td>
                      <td className="py-2">{r.score}</td>
                      <td className="py-2">{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}