import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectsPage from './pages/client/ClientProjectsPage';
import CreateProjectPage from './pages/client/CreateProjectPage';
import ClientContractsPage from './pages/client/ClientContractsPage';
import ClientContractDetailsPage from './pages/client/ClientContractDetailsPage';
import ClientWalletPage from './pages/client/ClientWalletPage';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerProposalsPage from './pages/freelancer/FreelancerProposalsPage';
import FreelancerContractsPage from './pages/freelancer/FreelancerContractsPage';
import FreelancerContractDetailsPage from './pages/freelancer/FreelancerContractDetailsPage';
import FreelancerProfilePage from './pages/freelancer/FreelancerProfilePage';
import FreelancerWalletPage from './pages/freelancer/FreelancerWalletPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';


export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-indigo-500 selection:text-white">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#f8fafc',
                },
              },
            }}
          />

          <Navbar />

          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />

              {/* Client Protected Dashboard Routes */}
              <Route
                path="/client"
                element={
                  <ProtectedRoute allowedRoles={['CLIENT']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="projects" element={<ClientProjectsPage />} />
                <Route path="projects/new" element={<CreateProjectPage />} />
                <Route path="contracts" element={<ClientContractsPage />} />
                <Route path="contracts/:id" element={<ClientContractDetailsPage />} />
                <Route path="wallet" element={<ClientWalletPage />} />
              </Route>

              {/* Freelancer Protected Dashboard Routes */}
              <Route
                path="/freelancer"
                element={
                  <ProtectedRoute allowedRoles={['FREELANCER']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FreelancerDashboard />} />
                <Route path="proposals" element={<FreelancerProposalsPage />} />
                <Route path="contracts" element={<FreelancerContractsPage />} />
                <Route path="contracts/:id" element={<FreelancerContractDetailsPage />} />
                <Route path="profile" element={<FreelancerProfilePage />} />
                <Route path="wallet" element={<FreelancerWalletPage />} />
              </Route>

              {/* Admin Protected Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="audit-logs" element={<AdminLogsPage />} />
              </Route>


              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
}
