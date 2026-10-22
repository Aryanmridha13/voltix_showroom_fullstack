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

                  {/* Vehicle Catalogue (Phase 13) */}
                  <Route
                    path="/vehicles"
                    element={
                      <PlaceholderPage
                        title="Vehicle Catalogue & Specs"
                        phase="Phase 13 Milestone"
                        description="Interactive EV catalogue with category filters, battery specs, price sorting, and dynamic imagery."
                        actionText="Try 3D Customizer"
                        actionLink="/customizer"
                      />
                    }
                  />
                  <Route
                    path="/vehicles/:id"
                    element={
                      <PlaceholderPage
                        title="Vehicle Specifications & Details"
                        phase="Phase 13 Milestone"
                        description="High-definition 360 viewer, technical specs sheet, verified rider reviews, and test ride trigger."
                        actionText="View Catalogue"
                        actionLink="/vehicles"
                      />
                    }
                  />

                  {/* 3D Customizer (Phase 14) */}
                  <Route
                    path="/customizer"
                    element={
                      <PlaceholderPage
                        title="Dynamic 3D Vehicle Customizer"
                        phase="Phase 14 Milestone"
                        description="Real-time single/dual-tone palette switcher, live price recalculation engine, and trim preview."
                        actionText="Book Test Ride"
                        actionLink="/book-test-ride"
                      />
                    }
                  />

                  {/* Book Test Ride & Customer History (Phase 15) */}
                  <Route
                    path="/book-test-ride"
                    element={
                      <PlaceholderPage
                        title="Experiential Test Ride Booking"
                        phase="Phase 15 Milestone"
                        description="45-minute test ride scheduling, automated slot availability calendar, and license verification."
                        actionText="Back to Home"
                        actionLink="/"
                      />
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <PlaceholderPage
                          title="My Test Ride Bookings"
                          phase="Phase 15 Milestone"
                          description="Real-time ride status tracker, cancellation request workflow, and ride preparation checklist."
                          actionText="Showroom Catalogue"
                          actionLink="/vehicles"
                        />
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
