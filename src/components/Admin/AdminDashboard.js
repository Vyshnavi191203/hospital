import React, { useState } from 'react';
import UserManagement from './UserManagement';
import AppointmentAdmin from './AppointmentAdmin';
import DoctorScheduleAdmin from './DoctorScheduleAdmin';
import MedicalHistoryAdmin from './MedicalHistoryAdmin';
import './admindashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
const [sidebarVisible, setSidebarVisible] = useState(true);
const [activeTab, setActiveTab] = useState('dashboard');
const navigate = useNavigate();

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
<h3 className="sidebar-title">Admin Menu</h3>
<button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
<button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
<button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Appointments</button>
<button className={activeTab === 'schedules' ? 'active' : ''} onClick={() => setActiveTab('schedules')}>Doctor Schedules</button>
<button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Medical History</button>
<button className="logout-btn" onClick={handleLogout}>Logout</button>
</div>
)}

<div className={`main-content ${!sidebarVisible ? 'full-width' : ''}`}>
<div className="top-bar"><h2>Admin Dashboard</h2></div>

{activeTab === 'dashboard' && (
<>
<div className="dashboard-grid-top">
<div className="dashboard-card">
<h3 className="card-title">Appointments (By Patient/Doctor)</h3>
<AppointmentAdmin />
</div>
<div className="dashboard-card">
<h3 className="card-title">Doctor Schedules (By Doctor)</h3>
<DoctorScheduleAdmin />
</div>
</div>
<div className="dashboard-grid-bottom">
<div className="dashboard-card">
<h3 className="card-title">Medical History (Search by Patient)</h3>
<MedicalHistoryAdmin />
</div>
</div>
</>
)}

{activeTab === 'users' && <UserManagement />}
{activeTab === 'appointments' && <AppointmentAdmin />}
{activeTab === 'schedules' && <DoctorScheduleAdmin />}
{activeTab === 'history' && <MedicalHistoryAdmin />}
</div>
</div>
</>
);
};

export default AdminDashboard;
