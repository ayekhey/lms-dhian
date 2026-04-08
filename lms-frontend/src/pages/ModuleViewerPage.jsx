import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ModuleViewerPage() {
  const [pages, setPages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/modules/${id}/pages`)
      .then(res => setPages(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const currentPage = pages[currentIndex];

  const handleNext = () => {
    setQuizAnswer(null);
    setQuizResult(null);
    setExtendOpen(false);
    setHelpOpen(false);
    setCurrentIndex(i => i + 1);
  };

  const handlePrev = () => {
    setQuizAnswer(null);
    setQuizResult(null);
    setExtendOpen(false);
    setHelpOpen(false);
    setCurrentIndex(i => i - 1);
  };

  const handleQuizAnswer = (index) => {
    setQuizAnswer(index);
    if (currentPage.miniQuiz) {
      setQuizResult(index === currentPage.miniQuiz.correctOption ? 'correct' : 'incorrect');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!currentPage) return <div className="p-8">No pages found.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/student/modules')} className="text-xl font-bold text-gray-800">
          ← Modules
        </button>
        <span className="text-sm text-gray-500">
          Page {currentIndex + 1} of {pages.length}
        </span>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500">
          Logout
        </button>
      </nav>

      <div className="max-w-3xl mx-auto p-8">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <p className="text-gray-800 leading-relaxed">{currentPage.content}</p>
        </div>

        {/* Extend Panel - Tier 2 and 3 */}
        {currentPage.extendContent && (
          <div className="bg-blue-50 rounded-lg shadow mb-4">
            <button
              onClick={() => setExtendOpen(o => !o)}
              className="w-full px-6 py-4 text-left font-semibold text-blue-800 flex justify-between"
            >
              📘 Extend
              <span>{extendOpen ? '▲' : '▼'}</span>
            </button>
            {extendOpen && (
              <div className="px-6 pb-4 text-blue-900 text-sm leading-relaxed">
                {currentPage.extendContent}
              </div>
            )}
          </div>
        )}

        {/* Help Panel - Tier 3 only */}
        {currentPage.helpContent && (
          <div className="bg-yellow-50 rounded-lg shadow mb-4">
            <button
              onClick={() => setHelpOpen(o => !o)}
              className="w-full px-6 py-4 text-left font-semibold text-yellow-800 flex justify-between"
            >
              💡 Help
              <span>{helpOpen ? '▲' : '▼'}</span>
            </button>
            {helpOpen && (
              <div className="px-6 pb-4 text-yellow-900 text-sm leading-relaxed">
                {currentPage.helpContent}
              </div>
            )}
          </div>
        )}

        {/* Mini Quiz */}
        {currentPage.miniQuiz && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Mini Quiz
            </h3>
            <p className="text-gray-700 mb-3">{currentPage.miniQuiz.questionText}</p>
            <div className="space-y-2">
              {currentPage.miniQuiz.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleQuizAnswer(i)}
                  disabled={quizAnswer !== null}
                  className={`w-full text-left px-4 py-2 rounded border text-sm
                    ${quizAnswer === i && quizResult === 'correct' ? 'bg-green-100 border-green-500 text-green-800' : ''}
                    ${quizAnswer === i && quizResult === 'incorrect' ? 'bg-red-100 border-red-500 text-red-800' : ''}
                    ${quizAnswer === null ? 'bg-white border-gray-300 hover:bg-gray-50' : ''}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizResult && (
              <p className={`mt-3 text-sm font-medium ${quizResult === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                {quizResult === 'correct' ? '✅ Correct!' : '❌ Incorrect. Try next page.'}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-200 rounded font-medium disabled:opacity-40 hover:bg-gray-300"
          >
            ← Previous
          </button>

          {currentIndex < pages.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => navigate('/student/modules')}
              className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
            >
              Finish ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}