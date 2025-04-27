// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
// Public Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Auth from './components/Auth';
import About from './components/About';
import Contact from './components/Contact';
import DepartmentsWithDoctors from './components/DepartmentsWithDoctors';
 
// Role-based Dashboards
import PatientDashboard from './components/patient/PatientDashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
 
// PrivateRoute: Protects dashboard routes based on role
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
 
  if (!token) return <Navigate to="/auth" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
};
 
function App() {
  return (
<Router>
      {/* ✅ Navbar appears on all pages */}
<Navbar />
 <ToastContainer/>
      <Routes>
        {/* ✅ Public Routes */}
<Route path="/" element={<Home />} />
<Route path="/auth" element={<Auth />} />
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/departments" element={<DepartmentsWithDoctors />} />
 
        {/* ✅ Protected Routes by Role */}
<Route
          path="/patient"
          element={
<PrivateRoute role="Patient">
<PatientDashboard />
</PrivateRoute>
          }
        />
<Route
          path="/doctor"
          element={
<PrivateRoute role="Doctor">
<DoctorDashboard />
</PrivateRoute>
          }
        />
<Route
          path="/admin"
          element={
<PrivateRoute role="Admin">
<AdminDashboard />
</PrivateRoute>
          }
        />
</Routes>
</Router>
  );
}
 
export default App;