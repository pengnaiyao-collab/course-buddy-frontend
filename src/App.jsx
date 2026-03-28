import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/auth/LoginPage';
import CourseLibraryPage from './pages/CourseLibrary/CourseLibraryPage';
import QAAssistantPage from './pages/QAAssistant/QAAssistantPage';
import CollaborationPage from './pages/Collaboration/CollaborationPage';
import NotesPage from './pages/Notes/NotesPage';
import KnowledgeBaseDashboard from './pages/KnowledgeBase/KnowledgeBaseDashboard';
import FileUploadPage from './pages/KnowledgeBase/FileUploadPage';
import FileListPage from './pages/KnowledgeBase/FileListPage';
import KnowledgePointPage from './pages/KnowledgeBase/KnowledgePointPage';
import VersionHistoryPage from './pages/KnowledgeBase/VersionHistoryPage';
import PermissionManagePage from './pages/KnowledgeBase/PermissionManagePage';

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
        <Route
          path="/kb"
          element={
            <PrivateRoute>
              <KnowledgeBaseDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/kb/upload"
          element={
            <PrivateRoute>
              <FileUploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/kb/files"
          element={
            <PrivateRoute>
              <FileListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/kb/knowledge"
          element={
            <PrivateRoute>
              <KnowledgePointPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/kb/versions"
          element={
            <PrivateRoute>
              <VersionHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/kb/permissions"
          element={
            <PrivateRoute>
              <PermissionManagePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
