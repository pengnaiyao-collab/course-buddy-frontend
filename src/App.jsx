import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './theme/ThemeContext';
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
import AIContentPage from './pages/AI/AIContentPage';
import UserProfilePage from './pages/UserProfile/UserProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotificationCenterPage from './pages/Notifications/NotificationCenterPage';
import MessageCenterPage from './pages/Messages/MessageCenterPage';
import GlobalSearchPage from './pages/Search/GlobalSearchPage';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
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
            path="/ai"
            element={
              <PrivateRoute>
                <AIContentPage />
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
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationCenterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessageCenterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <GlobalSearchPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
