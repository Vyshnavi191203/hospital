import React, { useEffect, useState } from 'react';

import axios from 'axios';

import './adminmodules.css';
import {toast} from 'react-toastify';

const AppointmentAdmin = () => {

  const [appointments, setAppointments] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [doctors, setDoctors] = useState([]);

  const [patients, setPatients] = useState([]);

  const [viewType, setViewType] = useState('All');

  const [searchId, setSearchId] = useState('');

  const [form, setForm] = useState({

    department: '',

    doctorId: '',

    patientId: '',

    appointmentDate: '',

    timeSlot: '',

    status: 'Scheduled'

  });

  const [availableDates, setAvailableDates] = useState([]);

  const [availableSlots, setAvailableSlots] = useState([]);

  const [editAppointmentId, setEditAppointmentId] = useState(null);

  const token = localStorage.getItem('token');

  const API_BASE = 'https://localhost:7166/api';

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAvailableDepartments();
        await fetchDoctors();
        await fetchPatients();
      } catch (err) {
        toast.error('Load Failed');
      }
    };
    loadData();
   }, []);
   useEffect(() => {
 if (patients.length > 0 && doctors.length > 0) {
   fetchAllAppointments();
 }
}, [patients, doctors]);

  const fetchInitialData = async () => {

    try {
  
      await fetchAvailableDepartments();
  
      await fetchDoctors();        // First fetch doctors
  
      await fetchPatients();       // Then fetch patients
  
      await fetchAllAppointments(); // THEN fetch appointments
  
    } catch (err) {
  
      toast.error('Initial Load Failed: ' + err.message);
  
    }
  
  }; 
  const fetchAllAppointments = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Appointment`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      mapAppointments(res.data);

    } catch {

      toast.error('Failed to fetch appointments');

    }

  };

  const fetchAvailableDepartments = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Appointment/available-departments`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setDepartments(res.data);

    } catch {

      toast.error('Failed to load departments');

    }

  };

  const fetchDoctors = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Users/by-role?role=doctor`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setDoctors(res.data);

    } catch {

      toast.error('Failed to fetch doctors');

    }

  };

  const fetchPatients = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Users/by-role?role=patient`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setPatients(res.data);

    } catch {

      toast.error('Failed to fetch patients');

    }

  };

  const mapAppointments = (data) => {

    const patientMap = {};

    patients.forEach(p => {

      patientMap[p.userId] = p.name;

    });

    const doctorMap = {};

    doctors.forEach(d => {

      doctorMap[d.userId] = d.name;

    });

    const updated = data.map(a => ({

      ...a,

      patientName: patientMap[a.patientId] || 'Unknown Patient',

      doctorName: doctorMap[a.doctorID] || 'Unknown Doctor'

    }));

    setAppointments(updated);

  };

  const handleSearch = async () => {

    const url = viewType === 'Doctor'

      ? `${API_BASE}/Appointment/by-doctor/${searchId}`

      : viewType === 'Patient'

      ? `${API_BASE}/Appointment/by-patient/${searchId}`

      : `${API_BASE}/Appointment`;

    try {

      const res = await axios.get(url, {

        headers: { Authorization: `Bearer ${token}` }

      });

      if (viewType === 'Doctor') {

        // Directly use patientName from API

        setAppointments(res.data);

      } else {

        // Map patientId and doctorId to names

        mapAppointments(res.data);

      }

    } catch {

      toast.error('Search failed');

    }

  };

  const handleFormChange = async (e) => {

    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === 'department') {

      const res = await axios.get(`${API_BASE}/Appointment/available-doctors-by-department`, {

        params: { department: value },

        headers: { Authorization: `Bearer ${token}` }

      });

      setDoctors(res.data);

      setForm(prev => ({ ...prev, doctorId: '', appointmentDate: '', timeSlot: '' }));

      setAvailableDates([]);

      setAvailableSlots([]);

    }

    if (name === 'doctorId') {

      const res = await axios.get(`${API_BASE}/Appointment/doctor-available-dates`, {

        params: { doctorId: value },

        headers: { Authorization: `Bearer ${token}` }

      });

      setAvailableDates(res.data);

      setForm(prev => ({ ...prev, appointmentDate: '', timeSlot: '' }));

      setAvailableSlots([]);

    }

    if (name === 'appointmentDate') {

      const res = await axios.get(`${API_BASE}/Appointment/doctors-by-date`, {

        params: { availableDate: value },

        headers: { Authorization: `Bearer ${token}` }

      });

      const slots = res.data.filter(s => s.doctorId === parseInt(form.doctorId));

      setAvailableSlots(slots);

    }

  };

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

      toast.success('Appointment added!');

      resetForm();

      fetchAllAppointments();

    } catch (err) {

      toast.error('Add failed: ' + err.message);

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

      toast.success('Rescheduled successfully!');

      resetForm();

      fetchAllAppointments();

    } catch (err) {

      toast.error('Reschedule failed: ' + err.message);

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

        toast.error('Cancel failed');

      }

    }

  };

  const resetForm = () => {

    setForm({

      department: '',

      doctorId: '',

      patientId: '',

      appointmentDate: '',

      timeSlot: '',

      status: 'Scheduled'

    });

    setEditAppointmentId(null);

    setAvailableDates([]);

    setAvailableSlots([]);

  };

  return (
<div>
<h3>Appointment Management</h3>

      {/* Search Section */}
<select onChange={(e) => setViewType(e.target.value)} value={viewType}>
<option>All</option>
<option>Doctor</option>
<option>Patient</option>
</select>

      {viewType !== 'All' && (
<>
<select value={searchId} onChange={(e) => setSearchId(e.target.value)}>
<option value="">Select {viewType}</option>

            {(viewType === 'Doctor' ? doctors : patients).map(u => (
<option key={u.userId} value={u.userId}>{u.name}</option>

            ))}
</select>
<button onClick={handleSearch}>Search</button>
</>

      )}

      {viewType === 'All' && (
<button onClick={fetchAllAppointments}>View All</button>

      )}

      {/* Add/Reschedule Appointment */}
<h5 className="mt-4">{editAppointmentId ? 'Reschedule Appointment' : 'Add Appointment'}</h5>
<div className="row mb-3">

        {/* Department */}
<div className="col-md-2">
<select name="department" value={form.department} onChange={handleFormChange} className="form-control" disabled={editAppointmentId}>
<option value="">Select Department</option>

            {departments.map((dept, i) => (
<option key={i} value={dept}>{dept}</option>

            ))}
</select>
</div>

        {/* Doctor */}
<div className="col-md-2">
<select name="doctorId" value={form.doctorId} onChange={handleFormChange} className="form-control" disabled={editAppointmentId}>
<option value="">Select Doctor</option>

            {doctors.map(doc => (
<option key={doc.userId} value={doc.userId}>{doc.name}</option>

            ))}
</select>
</div>

        {/* Patient */}
<div className="col-md-2">
<select name="patientId" value={form.patientId} onChange={handleFormChange} className="form-control" disabled={editAppointmentId}>
<option value="">Select Patient</option>

            {patients.map(p => (
<option key={p.userId} value={p.userId}>{p.name}</option>

            ))}
</select>
</div>

        {/* Date */}
<div className="col-md-2">
<select name="appointmentDate" value={form.appointmentDate} onChange={handleFormChange} className="form-control">
<option value="">Select Date</option>

            {availableDates.map(date => (
<option key={date} value={date}>{date}</option>

            ))}
</select>
</div>

        {/* Time Slot */}
<div className="col-md-2">
<select name="timeSlot" value={form.timeSlot} onChange={handleFormChange} className="form-control">
<option value="">Select Time</option>

            {availableSlots.map((slot, i) => (
<option key={i} value={slot.timeSlot}>{slot.timeSlot}</option>

            ))}
</select>
</div>

        {/* Button */}
<div className="col-md-2">

          {editAppointmentId ? (
<button className="btn btn-warning w-100" onClick={() => handleReschedule(editAppointmentId)}>Reschedule</button>

          ) : (
<button className="btn btn-success w-100" onClick={handleAddAppointment}>Add Appointment</button>

          )}
</div>
</div>

      {/* Appointments Table */}
<table className="table table-bordered mt-3">
<thead className="table-dark">
<tr>
   {viewType !== 'Patient' && <th>Patient Name</th>}
   {viewType !== 'Doctor' && <th>Doctor Name</th>}
<th>Date</th>
<th>Time</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>

  {appointments.map((a) => (
<tr key={a.appointmentID}>

      {viewType !== 'Patient' && <td>{a.patientName || 'N/A'}</td>}

      {viewType !== 'Doctor' && <td>{a.doctorName || 'N/A'}</td>}
<td>{a.appointmentDate}</td>
<td>{a.timeSlot}</td>
<td>{a.status}</td>
<td>
<button className="btn btn-info btn-sm me-2" onClick={async () => {

          setEditAppointmentId(a.appointmentID);

          setForm({

            ...form,

            doctorId: viewType === 'Doctor' ? searchId : a.doctorID,

            patientId: viewType === 'Patient' ? searchId : a.patientId,

            appointmentDate: a.appointmentDate,

            timeSlot: a.timeSlot

          });

          try {

            const resDates = await axios.get(`${API_BASE}/Appointment/doctor-available-dates`, {

              params: { doctorId: viewType === 'Doctor' ? searchId : a.doctorID },

              headers: { Authorization: `Bearer ${token}` }

            });

            setAvailableDates(resDates.data);

            if (a.appointmentDate) {

              const resSlots = await axios.get(`${API_BASE}/Appointment/doctors-by-date`, {

                params: { availableDate: a.appointmentDate },

                headers: { Authorization: `Bearer ${token}` }

              });

              const slots = resSlots.data.filter(s => s.doctorId === (viewType === 'Doctor' ? parseInt(searchId) : a.doctorID));

              setAvailableSlots(slots);

            }

          } catch (error) {

            console.error('Error fetching reschedule slots', error);

          }

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