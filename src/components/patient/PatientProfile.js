import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './patientprofile.css';
import {toast} from 'react-toastify';

const PatientProfile = () => {
  const [form, setForm] = useState({
    userId: '', name: '', email: '', role: '', age: '', phone: '', address: '', password: ''
  });

  const [loading, setLoading] = useState(true);
  const identifier = localStorage.getItem('identifier');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_BASE = 'https://localhost:7166/api';
        const isEmail = identifier.includes('@');
        const endpoint = isEmail ? `/Users/search?identifier=${identifier}` : `/Users/${identifier}`;

        const res = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm(res.data);
        localStorage.setItem('userId', res.data.userId);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const userId = localStorage.getItem('userId');
    const API_BASE = 'https://localhost:7166/api';
    try {
      await axios.put(`${API_BASE}/Users/${userId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  if (loading) return <p>Loading profile...</p>;

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
      {Object.entries(form).map(([key, val]) =>
        key !== 'userId' && (
          <div key={key} className="profile-field">
            <label>{key}:</label>
            <input
              name={key}
              type={key === 'password' ? 'password' : 'text'}
              value={val}
              onChange={handleChange}
              required
            />
          </div>
        )
      )}
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default PatientProfile;
