import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ManageUsersForm, LoginForm } from './components/form/Form';
import Layout from './components/layout/Layout';
import { isAuthenticated } from './utils/auth';

// ProtectedRoute only renders children if user is logged in
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// function AdminRoute({ children }) {
//   if (!isAuthenticated()) return <Navigate to="/login" replace />;
//   return isAdmin() ? children : <Navigate to="/" replace />;
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Layout wraps everything so header/footer always show */}
        <Route path="/" element={<Layout />}>
          {/* Protected route for main app */}
          <Route
            index
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          {/* Protected route for manage users form */}
          <Route
            path="manage-users"
            element={
              <ProtectedRoute>
                <ManageUsersForm />
              </ProtectedRoute>
            }
          />
          {/* Public routes */}
          <Route path="login" element={<LoginForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
