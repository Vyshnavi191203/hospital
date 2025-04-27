import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminmodules.css';
import {toast} from 'react-toastify';

const DoctorScheduleAdmin = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [form, setForm] = useState({
    scheduleId: 0,
    department: '',
    availableDate: '',
    timeSlot: ''
  });
  const [minDate, setMinDate] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = 'https://localhost:7166/api';

  // Fetch all departments initially
  useEffect(() => {
    fetchDepartments();
    setMinDate(new Date().toISOString().split('T')[0]); // Set minimum date to today
  }, []);

  // Fetch doctors when department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctorsByDepartment(selectedDepartment);
      setForm(prev => ({ ...prev, department: selectedDepartment }));
    }
  }, [selectedDepartment]);

  // Fetch schedules when doctor changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchSchedules();
    } else {
      setSchedules([]);
    }
  }, [selectedDoctor]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/DoctorSchedules/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch {
      toast.error('Error fetching departments');
    }
  };

  const fetchDoctorsByDepartment = async (dept) => {
    try {
      const res = await axios.get(`${API_BASE}/Appointment/doctors-by-department?department=${dept}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch {
      toast.error('Error fetching doctors');
    }
  };

  const fetchSchedules = async () => {
    if (!selectedDoctor) return;
    try {
      const res = await axios.get(`${API_BASE}/DoctorSchedules/by-Id/${selectedDoctor}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch {
      toast.error('Error fetching schedules');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !form.department || !form.availableDate || !form.timeSlot) {
      toast.warn('Please fill all fields');
      return;
    }

    const today = new Date();
    const selectedDate = new Date(form.availableDate);
    const [hours, minutes] = form.timeSlot.split(':').map(Number);
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

    // ❌ Reject past times for today's date
    const isToday = selectedDate.toDateString() === today.toDateString();
    const now = new Date();
    if (isToday && selectedDate <= now) {
      toast.error("❌ Cannot select a past time for today.");
      return;
    }

    const payload = {
      ...form,
      doctorId: selectedDoctor,
      timeSlot: form.timeSlot.length === 5 ? form.timeSlot + ':00' : form.timeSlot
    };

    try {
      if (form.scheduleId === 0) {
        await axios.post(`${API_BASE}/DoctorSchedules`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Schedule added!');
      } else {
        await axios.put(`${API_BASE}/DoctorSchedules`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Schedule updated!');
      }
      resetForm();
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to save schedule: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this schedule?')) {
      try {
        await axios.delete(`${API_BASE}/DoctorSchedules/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSchedules();
      } catch {
        toast.error('Failed to delete schedule');
      }
    }
  };

  const handleEdit = (s) => {
    setForm({
      scheduleId: s.scheduleId,
      department: s.department,
      availableDate: s.availableDate,
      timeSlot: s.timeSlot.slice(0, 5)
    });
    setSelectedDoctor(s.doctorId);
    setSelectedDepartment(s.department);
  };

  const resetForm = () => {
    setForm({ scheduleId: 0, department: selectedDepartment, availableDate: '', timeSlot: '' });
  };

  return (
    <div>
      <h3>Doctor Schedule Management</h3>

      {/* Department and Doctor Dropdowns */}
      <div className="row mb-2">
        <div className="col-md-3">
          <label>Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedDoctor(''); // Reset doctor selection when department changes
            }}
            className="form-control"
          >
            <option value="">Select Department</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Doctor</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="form-control"
            disabled={!selectedDepartment}
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.userId} value={doc.userId}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <button className="btn btn-primary mt-4 w-100" onClick={fetchSchedules} disabled={!selectedDoctor}>
            View Schedules
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <h5 className="mt-4">{form.scheduleId === 0 ? 'Add' : 'Update'} Schedule</h5>
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="date"
            name="availableDate"
            className="form-control"
            value={form.availableDate}
            onChange={handleChange}
            min={minDate} // Disable past dates in the calendar
          />
        </div>
        <div className="col-md-3">
          <input
            type="time"
            name="timeSlot"
            className="form-control"
            value={form.timeSlot}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-success w-100" onClick={handleSubmit} disabled={!selectedDoctor}>
            {form.scheduleId === 0 ? 'Add Schedule' : 'Update'}
          </button>
        </div>
        {form.scheduleId !== 0 && (
          <div className="col-md-3">
            <button className="btn btn-secondary w-100" onClick={resetForm}>Cancel</button>
          </div>
        )}
      </div>

      {/* Schedule Table */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.scheduleId}>
              <td>{s.availableDate}</td>
              <td>{s.timeSlot}</td>
              <td>{s.department}</td>
              <td>
                <button className="btn btn-info btn-sm me-2" onClick={() => handleEdit(s)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.scheduleId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorScheduleAdmin;