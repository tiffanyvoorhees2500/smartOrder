import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import PriceSheetPage from "./PriceSheetPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ManageUsersForm, LoginForm } from "./components/form/Form";
import Layout from "./components/layout/Layout";
import { isAuthenticated, isAdmin } from "./utils/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderContextProvider from "./PriceSheetContext";
import AdminOrderPage from "./AdminOrderPage";
import PastUserOrder from "./components/pastOrders/pastUserOrder";

// ProtectedRoute only renders children if user is logged in
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return isAdmin() ? children : <Navigate to="/" replace />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Toast container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <HeaderContextProvider>
        <Routes>
          {/* Layout wraps everything so header/footer always show */}
          <Route path="/" element={<Layout />}>
            {/* Protected route for main app */}
            <Route
              index
              element={
                <ProtectedRoute>
                  <Navigate to="/current-order" replace />
                </ProtectedRoute>
              }
            />
            {/* Protected route for current orders form */}
            <Route
              path="current-order"
              element={
                <ProtectedRoute>
                  <PriceSheetPage />
                </ProtectedRoute>
              }
            />
            {/* Protected route for manage users form */}
            <Route
              path="past-orders"
              element={
                <ProtectedRoute>
                  <PastUserOrder />
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

            {/* Admin only route for admin tasks */}
            <Route
              path="admin-order"
              element={
                <AdminRoute>
                  <AdminOrderPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin-past-orders"
              element={
                <AdminRoute>
                  <PastUserOrder />
                </AdminRoute>
              }
            />

            {/* Public routes */}
            <Route path="login" element={<LoginForm />} />
          </Route>
        </Routes>
      </HeaderContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
