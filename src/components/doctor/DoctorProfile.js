import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './doctorprofile.css'; // ✅ reuse same CSS file as PatientProfile
import {toast} from 'react-toastify';

const DoctorProfile = () => {
  const [form, setForm] = useState({});
  const identifier = localStorage.getItem('identifier');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`https://localhost:7166/api/Users/search?identifier=${identifier}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(response.data);
      } catch (error) {
        toast.error('Error fetching profile: ' + error.message);
      }
    };
    fetchProfile();
  }, [identifier, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`https://localhost:7166/api/Users/${form.userId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    }
  };

  return (
    <div className="profile-form">
      <h3>My Profile</h3>
      <div className="profile-field">
        <label>User ID:</label>
        <input
          name="userId"
          type="text"
          value={form.userId}
          readOnly
        />
      </div>
      {Object.entries(form).map(([key, value]) =>
        key !== 'userId' ? (
          <div key={key}>
            <label>{key}:</label>
            <input
              type={key === "password" ? "password" : "text"}
              name={key}
              value={value}
              onChange={handleChange}
            />
          </div>
        ) : null
      )}
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default DoctorProfile;
