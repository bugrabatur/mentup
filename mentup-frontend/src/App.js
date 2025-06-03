import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Navbar2 from './components/NavBar2/Navbar2';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Home from './pages/Home/Home';
import Pricing from './pages/pricing/Pricing';
import MenteeProfile from './pages/MenteeProfile/MenteeProfile';
import AboutUs from './pages/AboutUs/AboutUs';
import AccountSettings from './pages/accountSettings/AccountSettings';
import ApplyMentorship from './pages/applyMentorship/ApplyMentorship';
import Contact from './pages/contact/Contact';
import MentorReview from './pages/mentorReview/MentorReview';
import MentorLogin from './pages/MentorLogin/MentorLogin';
import BrowseMentors from './pages/browseMentors/BrowseMentors';
import Appointments from './pages/appointments/Appointments';
import Mentors from './pages/mentors/Mentors';
import VideoChat from './pages/videochat/VideoChat';
import AdminPanel from './admin/pages/adminPanel/adminPanel';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import ResetPassword  from './pages/resetPassword/resetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound/NotFound';
import MentorProfile from './mentorPages/mentorProfile/mentorProfile';
import MentorAccountSettings from './mentorPages/mentorAccountSettings/mentorAccountsettings';
import Navbar3 from './components/NavBar3/Navbar3';
import MentorAppointments from './mentorPages/mentorAppointments/mentorAppointments';
import MentorAvailabilitySettings from './mentorPages/mentorAvailabilitySettings/mentorAvailabilitySettings';
import MentorAppointmentRequests from './mentorPages/mentorAppointmentRequests/mentorAppointmentRequests';
import AppointmentRequests from './pages/appointmentRequests/appointmentRequests';
import ChatWidget from './components/chatWidget/chatWidget';
import NavBarAdmin from './components/NavBarAdmin/NavBarAdmin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);
    } else {
      setRole(null);
    }
  }, [location]);

  const noNavbarRoutes = ['/login', '/signup', '/forgotpassword', '/notfound' , '/reset-password'];

  // Navbar seçimi
  let navbarComponent = null;
  if (!noNavbarRoutes.includes(location.pathname)) {
    if (!isLoggedIn) {
      navbarComponent = <NavBar />;
    } else if (role === "mentee") {
      navbarComponent = <Navbar2 />;
    } else if (role === "mentor") {
      navbarComponent = <Navbar3 />;
    } else if (role === "admin") {
      navbarComponent = <NavBarAdmin />;
    }
  }

  return (
    <div className="App">
      {navbarComponent}
      {!noNavbarRoutes.includes(location.pathname) && role !== "admin" && <ChatWidget />}
      <Routes>
        {role === "admin" ? (
          <>
            <Route
              path="/adminpanel"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route
              path="/menteeprofile"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <MenteeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aboutus"
              element={<AboutUs />}
            />
            <Route
              path="/accountsettings"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applymentorship"
              element={<ApplyMentorship />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/mentorreview"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <MentorReview />
                </ProtectedRoute>
              }
            />
            <Route path="/mentorlogin" element={<MentorLogin />} />
            <Route
              path="/browsementors"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <BrowseMentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/videochat" element={<VideoChat />} />
            <Route
              path="/mentorprofile"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentoraccountsettings"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorAccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorappointments"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentoravailabilitysettings"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorAvailabilitySettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorappointmentrequests"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorAppointmentRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointmentrequests"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <AppointmentRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorreview/:mentor_id/:appointment_id"
              element={
                <ProtectedRoute requiredRole="mentee">
                  <MentorReview />
                </ProtectedRoute>
              }
            />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/notfound" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;