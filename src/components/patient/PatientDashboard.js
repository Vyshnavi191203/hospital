import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import PatientProfile from './PatientProfile';
import PatientAppointments from './PatientAppointments';
import AppointmentBooking from './AppointmentBooking';
import NotificationPopup from './NotificationPopup';
import './patientdashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const PatientDashboard = () => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate=useNavigate();

 
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem('token');
      const identifier = localStorage.getItem('identifier');
      const API_BASE = 'https://localhost:7166/api';
 
      if (!userId && token && identifier) {
        try {
          const isEmail = identifier.includes('@');
          const endpoint = isEmail
            ? `/Users/search?identifier=${identifier}`
            : `/Users/${identifier}`;
 
          const response = await axios.get(`${API_BASE}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
 
          if (response.data && response.data.userId) {
            localStorage.setItem('userId', response.data.userId);
            setUserId(response.data.userId);
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      }
    };
 
    fetchUserId();
  }, [userId]);
  const handleLogoClick=()=>{
     navigate('/');
  }
 
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(`https://localhost:7166/api/Auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Logout error:', err.message);
      }
    }
    localStorage.clear();
    window.location.href = '/';
  };
 
  return (
  <div>
<div className="dashboard-header">
<div className="navbar-left">
<button className="navbar-logo-btn" onClick={handleLogoClick}>Hospice</button>
<button className="toggle-sidebar-btn" onClick={() => setSidebarVisible(!sidebarVisible)}>☰</button>
</div>
</div>
<NotificationPopup />
 
      {/* Sidebar */}
<div className={`sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
<h3 className="sidebar-title">Menu</h3>
<button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</button>
<button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>📅 Appointments</button>
<button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
<button className={activeTab === 'book' ? 'active' : ''} onClick={() => setActiveTab('book')}>➕ Book</button>
<button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
</div>
      
 
      {/* Toggle button */}
 
      {/* Main content */}
<div className={`main-content ${!sidebarVisible ? 'full-width' : ''}`}>
<div className="top-bar">
<h2>Patient Dashboard</h2>
</div>
 
        {activeTab === 'dashboard' && (
<>
<div className="dashboard-grid-top">
<div className="dashboard-card">
<h3 className="card-title">My Profile</h3>
<PatientProfile />
</div>
<div className="dashboard-card">
<h3 className="card-title">Book New Appointment</h3>
<AppointmentBooking />
</div>
</div>
<div className="dashboard-grid-bottom">
<div className="dashboard-card">
<h3 className="card-title">My Appointments</h3>
<PatientAppointments />
</div>
</div>
</>
        )}
 
        {activeTab === 'appointments' && <PatientAppointments />}
        {activeTab === 'profile' && <PatientProfile />}
        {activeTab === 'book' && <AppointmentBooking />}
</div>
</div>
  );
};
 
export default PatientDashboard;