import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';

import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectsList from './components/Projects/ProjectsList';
import ProjectDetail from './components/Projects/ProjectDetail';

import './App.css';

// Simple Landing Page inline
const Landing = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-hero)' }}>
    <h1 style={{ fontSize: '5rem', fontWeight: 800, marginBottom: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</h1>
    <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Organize your team's work, beautifully.</p>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <a href="/login" className="btn btn-primary btn-lg">Log In</a>
      <a href="/register" className="btn btn-secondary btn-lg">Sign Up</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            style: { 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)' 
            } 
          }} 
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/profile" element={<div className="container" style={{paddingTop: '2rem'}}><h2>Profile Settings coming soon...</h2></div>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
