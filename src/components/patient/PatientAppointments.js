import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './patientappointment.css';
 
const API_BASE = 'https://localhost:7166/api';
 
const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeRescheduleId, setActiveRescheduleId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({});
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
 
  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);
 
  const fetchAppointments = async () => {
    if (!userId) {
      console.warn('User ID not available yet.');
      return;
    }
 
    try {
      const res = await axios.get(`${API_BASE}/Appointment/by-patient/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch {
      alert('Failed to load appointments');
    }
  };
 
  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`${API_BASE}/Appointment/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAppointments();
      } catch {
        alert('Failed to cancel appointment');
      }
    }
  };
 
  const openReschedule = async (appt) => {
    const { appointmentID, doctorID } = appt;
    setActiveRescheduleId(appointmentID);
    try {
      const res = await axios.get(`${API_BASE}/Appointment/doctor-available-dates`, {
        params: { doctorId: doctorID },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRescheduleData((prev) => ({
        ...prev,
        [appointmentID]: {
          doctorId: doctorID,
          date: '',
          time: '',
          availableDates: res.data,
          availableSlots: [],
        },
      }));
    } catch {
      alert('Failed to fetch available dates');
    }
  };
 
  const fetchTimeSlots = async (appointmentId, doctorId, selectedDate) => {
    try {
      const res = await axios.get(`${API_BASE}/Appointment/doctors-by-date`, {
        params: { availableDate: selectedDate },
        headers: { Authorization: `Bearer ${token}` },
      });
 
      const filtered = res.data.filter(slot => slot.doctorId === doctorId);
 
      setRescheduleData((prev) => ({
        ...prev,
        [appointmentId]: {
          ...prev[appointmentId],
          date: selectedDate,
          availableSlots: filtered,
          time: ''
        },
      }));
    } catch {
      alert('Failed to load time slots');
    }
  };
 
  const handleTimeChange = (appointmentId, time) => {
    setRescheduleData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        time
      }
    }));
  };
 
  const handleRescheduleSubmit = async (appointmentId) => {
    const data = rescheduleData[appointmentId];
    if (!data?.date || !data?.time) {
      alert('Please select both date and time');
      return;
    }
    const formattedTime = data.time.length === 5 ? `${data.time}:00` : data.time;
    try {
      await axios.put(`${API_BASE}/Appointment/reschedule/${appointmentId}`, {
        newAppointmentDate: data.date,
        newTimeSlot: formattedTime,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveRescheduleId(null);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    }
  };
 
  const closeReschedule = () => setActiveRescheduleId(null);
 
  return (
<div className="appointments-container">
<h2>My Appointments</h2>
<table className="appointments-table">
<thead>
<tr>
<th>Doctor</th>
<th>Date</th>
<th>Time</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
          {appointments.map((appt) => (
<React.Fragment key={appt.appointmentID}>
<tr>
<td>{appt.doctorName}</td>
<td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
<td>{appt.timeSlot}</td>
<td>{appt.status}</td>
<td>
<button className="btn-reschedule" onClick={() => openReschedule(appt)}>Reschedule</button>
<button className="btn-cancel" onClick={() => handleCancel(appt.appointmentID)}>Cancel</button>
</td>
</tr>
              {activeRescheduleId === appt.appointmentID && (
<tr className="reschedule-row">
<td colSpan="5">
                    {rescheduleData[appt.appointmentID]?.availableDates?.length === 0 ? (
<div className="no-slots-message">
                        Doctor is not available for other dates/time slots.
</div>
                    ) : (
<div className="reschedule-form">
<label>Date:</label>
<select
                          value={rescheduleData[appt.appointmentID]?.date || ''}
                          onChange={(e) => fetchTimeSlots(appt.appointmentID, appt.doctorID, e.target.value)}
>
<option value="">Select Date</option>
                          {rescheduleData[appt.appointmentID]?.availableDates.map((d) => (
<option key={d} value={d}>{d}</option>
                          ))}
</select>
 
                        <label>Time:</label>
<select
                          value={rescheduleData[appt.appointmentID]?.time || ''}
                          onChange={(e) => handleTimeChange(appt.appointmentID, e.target.value)}
>
<option value="">Select Time</option>
                          {rescheduleData[appt.appointmentID]?.availableSlots.map((slot, idx) => (
<option key={`${slot.timeSlot}-${idx}`} value={slot.timeSlot}>{slot.timeSlot}</option>
                          ))}
</select>
 
                        <button onClick={() => handleRescheduleSubmit(appt.appointmentID)}>Confirm</button>
<button className="btn-cancel" onClick={closeReschedule}>Close</button>
</div>
                    )}
</td>
</tr>
              )}
</React.Fragment>
          ))}
</tbody>
</table>
</div>
  );
};
 
export default PatientAppointments;