import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './doctorappointment.css';
import {toast} from 'react-toastify';
const API_BASE = 'https://localhost:7166/api';
const DoctorAppointment = () => {
 const [appointments, setAppointments] = useState([]);
 const [doctorId, setDoctorId] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const token = localStorage.getItem('token');
 const identifier = localStorage.getItem('identifier');
 useEffect(() => {
   cleanUpPastAppointmentsAndLoad();
 }, []);
 const cleanUpPastAppointmentsAndLoad = async () => {
   try {
     // Step 1: Delete past appointments
     await axios.delete(`${API_BASE}/Appointment/delete-past`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     // Step 2: Get logged-in doctor ID
     const res = await axios.get(`${API_BASE}/Users/search?identifier=${identifier}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const id = res.data.userId;
     setDoctorId(id);
     // Step 3: Fetch current/future appointments
     fetchAppointments(id);
   } catch (err) {
     toast.error('Error: ' + err.message);
   }
 };
 const fetchAppointments = async (id) => {
   try {
     const response = await axios.get(`${API_BASE}/Appointment/by-doctor/${id}`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     setAppointments(response.data);
   } catch (error) {
     toast.error('Error fetching doctor appointments: ' + error.message);
   }
 };
 return (
<div className="container mt-4">
<h2>My Appointments</h2>
     {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
     {appointments.length > 0 ? (
<table className="table table-bordered">
<thead className="table-dark">
<tr>
<th>Appointment Date</th>
<th>Time Slot</th>
<th>Patient Name</th> {/* <-- newly added */}
<th>Status</th>
</tr>
</thead>
<tbody>
           {appointments.map((appointment, index) => (
<tr key={index}>
<td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
<td>{appointment.timeSlot}</td>
<td>{appointment.patientName || 'N/A'}</td> {/* <-- newly added */}
<td>{appointment.status}</td>
</tr>
           ))}
</tbody>
</table>
     ) : (
<p>No appointments found for this doctor.</p>
     )}
</div>
 );
};
export default DoctorAppointment;