import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './doctorprofile.css';
const DoctorProfile = () => {
 const [form, setForm] = useState({});
 const [selectedFile, setSelectedFile] = useState(null);
 const [previewUrl, setPreviewUrl] = useState('');
 const identifier = localStorage.getItem('identifier');
 const token = localStorage.getItem('token');
 useEffect(() => {
   const fetchProfile = async () => {
     try {
       const response = await axios.get(`https://localhost:7166/api/Users/search?identifier=${identifier}`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setForm(response.data);
       setPreviewUrl(response.data.photoUrl ? `https://localhost:7166${response.data.photoUrl}` : '/doctor-placeholder.jpg');
     } catch (error) {
       alert('Error fetching profile: ' + error.message);
     }
   };
   fetchProfile();
 }, [identifier, token]);
 const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 const handleUpdate = async () => {
   try {
     await axios.put(`https://localhost:7166/api/Users/${form.userId}`, form, {
       headers: { Authorization: `Bearer ${token}` }
     });
     alert('Profile updated successfully');
   } catch (error) {
     alert('Error updating profile: ' + error.message);
   }
 };
 const handleFileChange = (e) => {
   const file = e.target.files[0];
   if (file) {
     setSelectedFile(file);
     const reader = new FileReader();
     reader.onloadend = () => {
       setPreviewUrl(reader.result);
     };
     reader.readAsDataURL(file);
   }
 };
 const handleImageUpload = async () => {
   if (!selectedFile) return;
   const formData = new FormData();
   formData.append('file', selectedFile);
   try {
     const res = await axios.post(`https://localhost:7166/api/Users/upload-photo/${form.userId}`, formData, {
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'multipart/form-data'
       }
     });
     alert(res.data.message);
     setPreviewUrl(`https://localhost:7166${res.data.photoUrl}`);
   } catch (error) {
     alert('Error uploading photo: ' + error.message);
   }
 };
 return (
<div className="profile-form">
<h3>My Profile</h3>
<label htmlFor="photo-upload">
<img
         src={previewUrl}
         alt="Doctor"
         className="profile-image"
         title="Click to change photo"
       />
</label>
<input
       id="photo-upload"
       type="file"
       accept="image/*"
       style={{ display: 'none' }}
       onChange={handleFileChange}
     />
     {selectedFile && <button onClick={handleImageUpload}>Upload Photo</button>}
     {Object.entries(form).map(([key, value]) =>
       key !== 'userId' && key !== 'photoUrl' ? (
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