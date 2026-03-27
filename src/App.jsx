import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/auth/LoginPage';
import CourseLibraryPage from './pages/CourseLibrary/CourseLibraryPage';
import QAAssistantPage from './pages/QAAssistant/QAAssistantPage';
import CollaborationPage from './pages/Collaboration/CollaborationPage';
import NotesPage from './pages/Notes/NotesPage';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/courses" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <CourseLibraryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/qa"
          element={
            <PrivateRoute>
              <QAAssistantPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/collaboration"
          element={
            <PrivateRoute>
              <CollaborationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
