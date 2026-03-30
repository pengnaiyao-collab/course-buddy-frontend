import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';

import CourseList from '@/pages/courses/CourseList';
import CourseDetail from '@/pages/courses/CourseDetail';
import NoteList from '@/pages/notes/NoteList';
import NoteEdit from '@/pages/notes/NoteEdit';
import OcrPage from '@/pages/notes/OcrPage';
import AiAssistant from '@/pages/ai/AiAssistant';
import TeamList from '@/pages/teams/TeamList';
import TeamDetail from '@/pages/teams/TeamDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'courses',
        element: <CourseList />,
      },
      {
        path: 'courses/:id',
        element: <CourseDetail />,
      },
      {
        path: 'notes',
        element: <NoteList />,
      },
      {
        path: 'notes/create',
        element: <NoteEdit />,
      },
      {
        path: 'notes/edit/:id',
        element: <NoteEdit />,
      },
      {
        path: 'notes/ocr',
        element: <OcrPage />,
      },
      {
        path: 'ai-assistant',
        element: <AiAssistant />,
      },
      {
        path: 'teams',
        element: <TeamList />,
      },
      {
        path: 'teams/:id',
        element: <TeamDetail />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;