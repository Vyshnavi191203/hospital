import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminmodules.css';
 
const AppointmentAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [viewType, setViewType] = useState('All');
  const [searchId, setSearchId] = useState('');
  const [form, setForm] = useState({ doctorId: '', patientId: '', appointmentDate: '', timeSlot: '', status: 'Scheduled' });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [editAppointmentId, setEditAppointmentId] = useState(null);
 
  const token = localStorage.getItem('token');
  const API_BASE = 'https://localhost:7166/api';
 
  useEffect(() => {
    fetchAllAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);
 
  const fetchAllAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Appointment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch {
      alert('Failed to fetch appointments');
    }
  };
 
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Users/by-role?role=Doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch {
      alert('Failed to fetch doctors');
    }
  };
 
  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Users/by-role?role=Patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch {
      alert('Failed to fetch patients');
    }
  };
 
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!form.doctorId) return;
      try {
        const res = await axios.get(`${API_BASE}/Appointment/doctor-available-dates`, {
          params: { doctorId: form.doctorId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableDates(res.data);
        setForm({ ...form, appointmentDate: '', timeSlot: '' });
        setAvailableSlots([]);
      } catch {
        alert('Failed to fetch available dates');
      }
    };
    fetchAvailableDates();
  }, [form.doctorId]);
 
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!form.appointmentDate || !form.doctorId) return;
      try {
        const res = await axios.get(`${API_BASE}/Appointment/doctors-by-date`, {
          params: { availableDate: form.appointmentDate },
          headers: { Authorization: `Bearer ${token}` }
        });
        const slots = res.data.filter(s => s.doctorId === parseInt(form.doctorId));
        setAvailableSlots(slots);
      } catch {
        alert('Failed to fetch time slots');
      }
    };
    fetchTimeSlots();
  }, [form.appointmentDate]);
 
  const handleSearch = async () => {
    const url = viewType === 'Doctor'
      ? `${API_BASE}/Appointment/by-doctor/${searchId}`
      : `${API_BASE}/Appointment/by-patient/${searchId}`;
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch {
      alert('Search failed');
    }
  };
 
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleAddAppointment = async () => {
    try {
      const payload = {
        userId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot.length === 5 ? `${form.timeSlot}:00` : form.timeSlot,
        status: form.status
      };
      await axios.post(`${API_BASE}/Appointment`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment added!');
      resetForm();
      fetchAllAppointments();
    } catch (err) {
      alert('Add failed: ' + err.message);
    }
  };
 
  const handleReschedule = async (id) => {
    try {
      await axios.put(`${API_BASE}/Appointment/reschedule/${id}`, {
        newAppointmentDate: form.appointmentDate,
        newTimeSlot: form.timeSlot.length === 5 ? `${form.timeSlot}:00` : form.timeSlot
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Rescheduled successfully!');
      resetForm();
      fetchAllAppointments();
    } catch (err) {
      alert('Reschedule failed: ' + err.message);
    }
  };
 
  const handleDelete = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await axios.delete(`${API_BASE}/Appointment/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllAppointments();
      } catch {
        alert('Cancel failed');
      }
    }
  };
 
  const resetForm = () => {
    setForm({ doctorId: '', patientId: '', appointmentDate: '', timeSlot: '', status: 'Scheduled' });
    setEditAppointmentId(null);
    setAvailableDates([]);
    setAvailableSlots([]);
  };
 
  return (
<div>
<h3>Appointment Management</h3>
 
      <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
<option>All</option>
<option>Doctor</option>
<option>Patient</option>
</select>
 
      {viewType === 'Doctor' && (
<>
<select value={searchId} onChange={(e) => setSearchId(e.target.value)}>
<option value="">Select Doctor</option>
            {doctors.map(doc => (
<option key={doc.userId} value={doc.userId}>{doc.name}</option>
            ))}
</select>
<button onClick={handleSearch}>Search</button>
</>
      )}
 
      {viewType === 'Patient' && (
<>
<select value={searchId} onChange={(e) => setSearchId(e.target.value)}>
<option value="">Select Patient</option>
            {patients.map(p => (
<option key={p.userId} value={p.userId}>{p.name}</option>
            ))}
</select>
<button onClick={handleSearch}>Search</button>
</>
      )}
 
      {viewType === 'All' && <button onClick={fetchAllAppointments}>View All</button>}
 
      <h5 className="mt-4">{editAppointmentId ? 'Reschedule Appointment' : 'Add Appointment'}</h5>
<div className="row mb-3">
<div className="col-md-2">
<select name="doctorId" value={form.doctorId} onChange={handleFormChange} className="form-control">
<option value="">Select Doctor</option>
            {doctors.map(doc => (
<option key={doc.userId} value={doc.userId}>{doc.name}</option>
            ))}
</select>
</div>
<div className="col-md-2">
<select name="patientId" value={form.patientId} onChange={handleFormChange} className="form-control">
<option value="">Select Patient</option>
            {patients.map(p => (
<option key={p.userId} value={p.userId}>{p.name}</option>
            ))}
</select>
</div>
<div className="col-md-2">
<select name="appointmentDate" value={form.appointmentDate} onChange={handleFormChange} className="form-control">
<option value="">Select Date</option>
            {availableDates.map(date => (
<option key={date} value={date}>{date}</option>
            ))}
</select>
</div>
<div className="col-md-2">
<select name="timeSlot" value={form.timeSlot} onChange={handleFormChange} className="form-control">
<option value="">Select Time</option>
            {availableSlots.map((slot, i) => (
<option key={i} value={slot.timeSlot}>{slot.timeSlot}</option>
            ))}
</select>
</div>
<div className="col-md-2">
          {editAppointmentId ? (
<button className="btn btn-warning" onClick={() => handleReschedule(editAppointmentId)}>Reschedule</button>
          ) : (
<button className="btn btn-success" onClick={handleAddAppointment}>Add</button>
          )}
</div>
<div className="col-md-2">
          {editAppointmentId && (
<button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          )}
</div>
</div>
 
      <table className="table table-bordered mt-3">
<thead className="table-dark">
<tr><th>ID</th><th>Patient ID</th><th>Doctor ID</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
</thead>
<tbody>
          {appointments.map(a => (
<tr key={a.appointmentID}>
<td>{a.appointmentID}</td>
<td>{a.patientId}</td>
<td>{a.doctorID}</td>
<td>{a.appointmentDate}</td>
<td>{a.timeSlot}</td>
<td>{a.status}</td>
<td>
<button className="btn btn-info btn-sm me-2" onClick={() => {
                  setEditAppointmentId(a.appointmentID);
                  setForm({
                    ...form,
                    doctorId: a.doctorID,
                    patientId: a.patientId,
                    appointmentDate: a.appointmentDate,
                    timeSlot: a.timeSlot
                  });
                }}>Reschedule</button>
<button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.appointmentID)}>Cancel</button>
</td>
</tr>
          ))}
</tbody>
</table>
</div>
  );
};
 
export default AppointmentAdmin;