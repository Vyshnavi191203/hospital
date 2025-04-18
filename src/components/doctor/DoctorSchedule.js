import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './doctorschedule.css';

const DoctorSchedule = () => {
  const API_URL = 'https://localhost:7166/api/DoctorSchedules';
  const token = localStorage.getItem('token');
  const identifier = localStorage.getItem('identifier');

  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [form, setForm] = useState({
    scheduleId: 0,
    department: '',
    availableDate: '',
    timeSlot: ''
  });

  useEffect(() => {
    fetchDoctorIdAndSchedules();
    fetchDepartments();
  }, []);

  const fetchDoctorIdAndSchedules = async () => {
    try {
      const isEmail = identifier.includes('@');
      const endpoint = isEmail
        ? `/Users/search?identifier=${identifier}`
        : `/Users/${identifier}`;

      const res = await axios.get(`https://localhost:7166/api${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const id = res.data.userId;
      setDoctorId(id);
      setForm(prev => ({ ...prev, doctorId: id }));

      await axios.delete(`${API_URL}/cleanup/past`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchSchedules(id);
    } catch (err) {
      console.error('Failed to fetch doctor ID or schedules:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchSchedules = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/by-Id/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    const selectedDate = new Date(form.availableDate);
    const [hours, minutes] = form.timeSlot.split(':').map(Number);
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

    // ❌ Reject past dates and times
    if (selectedDate < today) {
      window.alert("❌ Cannot select a past date or time.");
      return;
    }

    // ❌ Only allow schedules for the same department as existing ones
    if (
      schedules.length > 0 &&
      schedules.some(s => s.department.toLowerCase() !== form.department.toLowerCase())
    ) {
      window.alert("❌ You already have schedules for a different department. Changing department is not allowed.");
      return;
    }

    const formattedTime = form.timeSlot.length === 5 ? form.timeSlot + ':00' : form.timeSlot;

    const payload = {
      ...form,
      doctorId: doctorId,
      timeSlot: formattedTime
    };

    try {
      if (form.scheduleId === 0) {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Schedule added successfully');
      } else {
        await axios.put(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Schedule updated successfully');
      }

      resetForm();
      fetchSchedules(doctorId);
    } catch (err) {
      console.error('❌ Failed to save schedule:', err.response?.data || err.message);
      window.alert("❌ Error saving schedule. Please check input or server.");
    }
  };

  const handleEdit = (s) => {
    setForm({
      scheduleId: s.scheduleId,
      department: s.department,
      availableDate: s.availableDate,
      timeSlot: s.timeSlot.slice(0, 5) // Remove seconds from display
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSchedules(doctorId);
      } catch (err) {
        console.error('Failed to delete schedule:', err);
      }
    }
  };

  const resetForm = () => {
    setForm({
      scheduleId: 0,
      department: schedules.length > 0 ? schedules[0].department : '',
      availableDate: '',
      timeSlot: ''
    });
  };

  return (
    <div className="container mt-4">
      <h3>My Doctor Schedules</h3>

      <form onSubmit={handleSubmit} className="row g-3 mb-3">
        <div className="col-md-4">
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dep, idx) => (
              <option key={idx} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="date"
            name="availableDate"
            className="form-control"
            value={form.availableDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="time"
            name="timeSlot"
            className="form-control"
            value={form.timeSlot}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            {form.scheduleId === 0 ? 'Add Schedule' : 'Update'}
          </button>
        </div>
      </form>

      <table className="table table-bordered mt-4">
        <thead className="table-dark">
          <tr>
            <th>Department</th>
            <th>Available Date</th>
            <th>Time Slot</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.scheduleId}>
              <td>{s.department}</td>
              <td>{s.availableDate}</td>
              <td>{s.timeSlot}</td>
              <td>
                <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(s)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.scheduleId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorSchedule;