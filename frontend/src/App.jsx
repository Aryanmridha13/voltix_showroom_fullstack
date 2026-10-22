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
import PlaceholderPage from './pages/PlaceholderPage';
import VehicleCatalogue from './pages/VehicleCatalogue';
import VehicleDetail from './pages/VehicleDetail';
import Customizer from './pages/Customizer';
import BookTestRide from './pages/BookTestRide';
import MyBookings from './pages/MyBookings';

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

                  {/* Spare Parts (Phase 16) */}
                  <Route
                    path="/parts"
                    element={
                      <PlaceholderPage
                        title="Spare Parts & Inventory"
                        phase="Phase 16 Milestone"
                        description="Genuine OEM parts inventory, stock availability indicators, compatibility filter, and order inquiry."
                        actionText="Back to Home"
                        actionLink="/"
                      />
                    }
                  />

                  {/* Admin Management Portal (Phase 17) */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <PlaceholderPage
                          title="Admin Showroom Command Center"
                          phase="Phase 17 Milestone"
                          description="Inventory stock adjuster, review moderation queue, booking status manager, and showroom metrics."
                          actionText="Back to Showroom"
                          actionLink="/"
                        />
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
