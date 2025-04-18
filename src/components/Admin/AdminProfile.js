import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminprofile.css'; // ✅ same styling as patient profile
 
const AdminProfile = () => {
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    password: ''
  });
 
  const token = localStorage.getItem('token');
  const identifier = localStorage.getItem('identifier');
 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `https://localhost:7166/api/Users/search?identifier=${identifier}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setForm(res.data);
        localStorage.setItem('userId', res.data.userId); // if needed elsewhere
      } catch (err) {
        alert('Failed to load admin profile');
      }
    };
 
    fetchProfile();
  }, [identifier, token]);
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleUpdate = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(
        `https://localhost:7166/api/Users/${userId}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };
 
  return (
<div className="profile-form">
<h3>My Profile</h3>
      {Object.entries(form).map(([key, val]) =>
        key !== 'userId' ? (
<div key={key}>
<label>{key}:</label>
<input
              name={key}
              type={key === 'password' ? 'password' : 'text'}
              value={val}
              onChange={handleChange}
              required
            />
</div>
        ) : null
      )}
<button onClick={handleUpdate}>Update</button>
</div>
  );
};
 
export default AdminProfile;