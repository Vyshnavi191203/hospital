import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentsWithDoctors.css';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'Patient') {
      navigate('/auth'); // Redirect to login/register page
    } else {
      navigate('/patient'); // Redirect to patient booking page
    }
  };

  return (
    <div className="doctor-card">
      
      <h4>Dr. {doctor.name}</h4>
      <p>{doctor.department}</p>
      <p>Email: {doctor.email}</p>
      <button className="book-btn" onClick={handleBookClick}>Book Appointment</button>
    </div>
  );
};

export default DoctorCard;
