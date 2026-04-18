import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentRoute from './guards/StudentRoute';
import TeacherRoute from './guards/TeacherRoute';

import LoginPage from './pages/LoginPage';
import DiagnosticPage from './pages/DiagnosticPage';
import StudentDashboard from './pages/StudentDashboard';
import ModuleListPage from './pages/ModuleListPage';
import ModuleViewerPage from './pages/ModuleViewerPage';
import MediaPage from './pages/MediaPage';
// import ExercisePage from './pages/ExercisePage';
import PostTestPage from './pages/PostTestPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherModulePage from './pages/TeacherModulePage';
import TeacherModuleEditPage from './pages/TeacherModuleEditPage';
import TeacherTopicEditPage from './pages/TeacherTopicEditPage';

import TeacherMediaPage from './pages/TeacherMediaPage';
import TeacherExercisePage from './pages/TeacherExercisePage';
import TeacherDiagnosticPage from './pages/TeacherDiagnosticPage';
import TeacherStudentPage from './pages/TeacherStudentPage';

function DiagnosticRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'STUDENT') return <Navigate to="/teacher/dashboard" />;
  if (user.diagnosticDone) return <Navigate to="/student/dashboard" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/diagnostic" element={
            <DiagnosticRoute><DiagnosticPage /></DiagnosticRoute>
          } />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/student/modules" element={<StudentRoute><ModuleListPage /></StudentRoute>} />
          <Route path="/student/modules/:id" element={<StudentRoute><ModuleViewerPage /></StudentRoute>} />
          <Route path="/student/media" element={<StudentRoute><MediaPage /></StudentRoute>} />
          {/* <Route path="/student/exercises" element={<StudentRoute><ExercisePage /></StudentRoute>} /> */}
          <Route path="/student/posttest" element={<StudentRoute><PostTestPage /></StudentRoute>} />

          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/modules" element={<TeacherRoute><TeacherModulePage /></TeacherRoute>} />
          <Route path="/teacher/modules/:id/edit" element={<TeacherRoute><TeacherModuleEditPage /></TeacherRoute>} />
          <Route path="/teacher/media" element={<TeacherRoute><TeacherMediaPage /></TeacherRoute>} />
          <Route path="/teacher/exercises" element={<TeacherRoute><TeacherExercisePage /></TeacherRoute>} />
          <Route path="/teacher/diagnostic" element={<TeacherRoute><TeacherDiagnosticPage /></TeacherRoute>} />
          <Route path="/teacher/students" element={<TeacherRoute><TeacherStudentPage /></TeacherRoute>} />
          <Route path="/teacher/modules/:id/topics/:topicId/edit" element={<TeacherRoute><TeacherTopicEditPage /></TeacherRoute>} />


          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}