import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import GradesPage from '../pages/GradesPage';
import AbsencesPage from '../pages/AbsencesPage';
import UsersPage from '../pages/UsersPage';
import StatsPage from '../pages/StatsPage';
import ParentStudentLinksPage from '../pages/ParentStudentLinksPage';
import NotAuthorizedPage from '../pages/NotAuthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/students" element={<ProtectedRoute allowedRoles={["admin","director","teacher","parent","student"]}><StudentsPage /></ProtectedRoute>} />
    <Route path="/grades" element={<ProtectedRoute allowedRoles={["admin","director","teacher","parent","student"]}><GradesPage /></ProtectedRoute>} />
    <Route path="/absences" element={<ProtectedRoute allowedRoles={["admin","director","teacher","parent","student"]}><AbsencesPage /></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
    <Route path="/parent-links" element={<ProtectedRoute allowedRoles={["admin"]}><ParentStudentLinksPage /></ProtectedRoute>} />
    <Route path="/stats" element={<ProtectedRoute allowedRoles={["admin","director","teacher","parent","student"]}><StatsPage /></ProtectedRoute>} />
    <Route path="/not-authorized" element={<NotAuthorizedPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes; 