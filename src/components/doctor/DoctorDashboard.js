import React, { useState, useEffect } from 'react';
import DoctorProfile from './DoctorProfile';
import DoctorAppointment from './DoctorAppointment';
import DoctorSchedule from './DoctorSchedule';
import MedicalHistoryForm from './MedicalHistoryForm';
import './doctordashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';

const DoctorDashboard = () => {
const [userId, setUserId] = useState(localStorage.getItem('userId'));
const [sidebarVisible, setSidebarVisible] = useState(true);
const [activeTab, setActiveTab] = useState('dashboard');
const navigate = useNavigate();



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
toast.error('Failed to fetch doctor ID:', err);
}
}
};

fetchUserId();
}, [userId]);
const handleLogoClick = () => {
   navigate('/');
  };
const handleLogout = () => {
localStorage.clear();
window.location.href = '/';
};

return (
<>
<div className="dashboard-header">
<div className="navbar-left">
<button className="navbar-logo-btn" onClick={handleLogoClick}>Hospice</button>
<button className="toggle-sidebar-btn" onClick={() => setSidebarVisible(!sidebarVisible)}>☰</button>
</div>
</div>

<div className="dashboard-container">
{sidebarVisible && (
<div className="sidebar">
<h3 className="sidebar-title">Doctor Menu</h3>
<button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>My Dashboard</button>
<button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>My Profile</button>
<button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>My Appointments</button>
<button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>My Schedule</button>
<button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Medical History</button>
<button className="logout-btn" onClick={handleLogout}>Logout</button>
</div>
)}

<div className={`main-content ${!sidebarVisible ? 'full-width' : ''}`}>
<div className="top-bar"><h2>Doctor Dashboard</h2></div>

{activeTab === 'dashboard' && (
<>
<div className="dashboard-grid-top">
<div className="dashboard-card">
<h3 className="card-title">My Schedules</h3>
<DoctorSchedule />
</div>
<div className="dashboard-card">
<h3 className="card-title">My Appointments</h3>
<DoctorAppointment />
</div>
</div>
<div className="dashboard-grid-bottom">
<div className="dashboard-card">
<h3 className="card-title">Doctor - Medical History</h3>
<MedicalHistoryForm />
</div>
</div>
</>
)}

{activeTab === 'appointments' && <DoctorAppointment />}
{activeTab === 'schedule' && <DoctorSchedule />}
{activeTab === 'history' && <MedicalHistoryForm />}
{activeTab === 'profile' && <DoctorProfile />}
</div>
</div>
</>
);
};

export default DoctorDashboard;