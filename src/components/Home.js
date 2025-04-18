import React from 'react';
import './home.css';
import { useNavigate } from 'react-router-dom';

 
const Home = () => {
  const navigate = useNavigate();
 
  const handleBookClick = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
 
    if (!token || role !== 'Patient') {
      navigate('/auth'); // Redirect to login/register
    } else {
      navigate('/patient'); // Redirect to patient dashboard
    }
  };
 
  return (
<div className="home-container">
      {/* Left Side */}
<div className="home-left">
<h1>
          We Care for Your <span style={{ color: '#3f86f2' }}>Health</span> Every Moment
</h1>
<p>
          Experience seamless digital healthcare with expert doctors across various departments.
          Book your appointment with a few simple clicks.
</p>
<button className="home-button" onClick={handleBookClick}>
          Book Appointment
</button>
</div>
 
      {/* Right Side */}
<div className="home-right"></div>
</div>
  );
};
 
export default Home;