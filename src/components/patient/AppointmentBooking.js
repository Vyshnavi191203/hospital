import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './appointmentbooking.css';
import {toast} from 'react-toastify';
const API_BASE = 'https://localhost:7166/api';
const AppointmentBooking = () => {
 const [departments, setDepartments] = useState([]);
 const [doctors, setDoctors] = useState([]);
 const [availableDates, setAvailableDates] = useState([]);
 const [availableSlots, setAvailableSlots] = useState([]);
 const [selectedDepartment, setSelectedDepartment] = useState('');
 const [selectedDoctorId, setSelectedDoctorId] = useState('');
 const [selectedDate, setSelectedDate] = useState('');
 const [appointmentTime, setAppointmentTime] = useState('');
 const [status, setStatus] = useState('Scheduled');
 const [bookingError, setBookingError] = useState('');
 const [bookingSuccess, setBookingSuccess] = useState('');
 const token = localStorage.getItem('token');
 const userId = localStorage.getItem('userId');
 useEffect(() => {
   fetchDepartments();
 }, []);
 const fetchDepartments = async () => {
   try {
     const res = await axios.get(`${API_BASE}/Appointment/available-departments`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     setDepartments(res.data);
   } catch {
     toast.error('Failed to load available departments');
   }
 };
 const fetchDoctors = async () => {
   if (!selectedDepartment) return;
   try {
     const res = await axios.get(`${API_BASE}/Appointment/available-doctors-by-department`, {
       params: { department: selectedDepartment },
       headers: { Authorization: `Bearer ${token}` },
     });
     setDoctors(res.data);
   } catch {
     toast.error('No doctors available in this department');
   }
 };
 const fetchAvailableDates = async () => {
   if (!selectedDoctorId) return;
   try {
     const res = await axios.get(`${API_BASE}/Appointment/doctor-available-dates`, {
       params: { doctorId: selectedDoctorId },
       headers: { Authorization: `Bearer ${token}` },
     });
     setAvailableDates(res.data);
   } catch {
     toast.error('No available dates for this doctor');
   }
 };
 const fetchSlotsByDate = async () => {
   if (!selectedDoctorId || !selectedDate) return;
   try {
     const res = await axios.get(`${API_BASE}/Appointment/doctors-by-date`, {
       params: { availableDate: selectedDate },
       headers: { Authorization: `Bearer ${token}` },
     });
     const filtered = res.data.filter(slot => slot.doctorId === Number(selectedDoctorId));
     setAvailableSlots(filtered);
   } catch {
     toast.error('No available time slots for this date');
   }
 };
 useEffect(() => {
   fetchDoctors();
   setSelectedDoctorId('');
   setAvailableDates([]);
   setSelectedDate('');
   setAvailableSlots([]);
 }, [selectedDepartment]);
 useEffect(() => {
   fetchAvailableDates();
   setSelectedDate('');
   setAvailableSlots([]);
 }, [selectedDoctorId]);
 useEffect(() => {
   fetchSlotsByDate();
   setAppointmentTime('');
 }, [selectedDate]);
 const handleBooking = async () => {
   if (!selectedDepartment || !selectedDoctorId || !selectedDate || !appointmentTime) {
     setBookingError('Please complete all fields.');
     setBookingSuccess('');
     return;
   }
   const formattedTime = appointmentTime.length === 5 ? `${appointmentTime}:00` : appointmentTime;
   try {
     const res = await axios.post(`${API_BASE}/Appointment`, {
       userId: parseInt(userId),
       doctorId: parseInt(selectedDoctorId),
       appointmentDate: selectedDate,
       timeSlot: formattedTime,
       status: status,
     }, {
       headers: { Authorization: `Bearer ${token}` },
     });
     await axios.post(`${API_BASE}/Notification/send/${res.data.appointmentID}`, {}, {
       headers: { Authorization: `Bearer ${token}` },
     });
     setBookingSuccess('Appointment booked successfully!');
     setBookingError('');
     setSelectedDepartment('');
     setSelectedDoctorId('');
     setSelectedDate('');
     setAppointmentTime('');
     setAvailableDates([]);
     setAvailableSlots([]);
   } catch {
     setBookingError('Failed to book appointment. You might already have an appointment at that time.');
     setBookingSuccess('');
   }
 };
 return (
<div className="appointment-form">
<h4>Book New Appointment</h4>
     {bookingError && <div className="error-message">{bookingError}</div>}
     {bookingSuccess && <div className="success-message">{bookingSuccess}</div>}
<div className="form-group">
<label>Department:</label>
<select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
<option value="">Select Department</option>
         {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
</select>
</div>
<div className="form-group">
<label>Doctor:</label>
<select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
<option value="">Select Doctor</option>
         {doctors.map((doc) => <option key={doc.userId} value={doc.userId}>{doc.name}</option>)}
</select>
</div>
<div className="form-group">
<label>Available Date:</label>
<select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
<option value="">Select Date</option>
         {availableDates.map((date, idx) => <option key={idx} value={date}>{date}</option>)}
</select>
</div>
<div className="form-group">
<label>Available Time Slot:</label>
<select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)}>
<option value="">Select Time</option>
         {availableSlots.map((slot, idx) => <option key={idx} value={slot.timeSlot}>{slot.timeSlot}</option>)}
</select>
</div>
<button onClick={handleBooking}>Book Appointment</button>
</div>
 );
};
export default AppointmentBooking;