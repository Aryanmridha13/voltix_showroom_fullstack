import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import VehicleCatalogue from './pages/VehicleCatalogue';
import VehicleDetail from './pages/VehicleDetail';
import Customizer from './pages/Customizer';
import BookTestRide from './pages/BookTestRide';
import MyBookings from './pages/MyBookings';
import SparePartsCatalogue from './pages/SparePartsCatalogue';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Core Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Vehicle Catalogue & Details */}
                  <Route path="/vehicles" element={<VehicleCatalogue />} />
                  <Route path="/vehicles/:id" element={<VehicleDetail />} />

                  {/* 3D Customizer Studio */}
                  <Route path="/customizer" element={<Customizer />} />

                  {/* Book Test Ride & Customer History */}
                  <Route path="/book-test-ride" element={<BookTestRide />} />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Spare Parts Catalogue */}
                  <Route path="/parts" element={<SparePartsCatalogue />} />

                  {/* Admin Management Portal */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}
