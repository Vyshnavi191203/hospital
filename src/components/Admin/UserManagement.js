import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Button, Alert } from 'react-bootstrap';
import './usermanagement.css';
const UserManagement = ({ showAdminProfile }) => {
 const [users, setUsers] = useState([]);
 const [form, setForm] = useState(null);
 const [roleFilter, setRoleFilter] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const token = localStorage.getItem('token');
 const identifier = localStorage.getItem('identifier');
 useEffect(() => {
   if (showAdminProfile) {
     fetchAdmin();
   } else {
     fetchAllUsers();
   }
 }, []);
 const fetchAdmin = async () => {
   try {
     const res = await axios.get(`https://localhost:7166/api/Users/search?identifier=${identifier}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setForm(res.data);
   } catch {
     setError('Error fetching admin profile');
   }
 };
 const fetchAllUsers = async () => {
   try {
     const res = await axios.get('https://localhost:7166/api/Users', {
       headers: { Authorization: `Bearer ${token}` }
     });
     setUsers(res.data);
   } catch {
     setError('Error fetching users');
   }
 };
 const fetchUsersByRole = async () => {
   try {
     const res = await axios.get(`https://localhost:7166/api/Users/by-role?role=${roleFilter}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setUsers(res.data);
   } catch {
     setError('Failed to filter users by role');
   }
 };
 const handleChange = (e) => {
   setForm({ ...form, [e.target.name]: e.target.value });
 };
 const handleUpdate = async () => {
   try {
     await axios.put(`https://localhost:7166/api/Users/${form.userId}`, form, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setSuccess('User updated successfully');
     setError('');
     setForm(null);
     fetchAllUsers();
   } catch {
     setError('Failed to update user');
   }
 };
 const handleDelete = async (userId) => {
   if (window.confirm('Are you sure you want to delete this user?')) {
     try {
       await axios.delete(`https://localhost:7166/api/Users/${userId}`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setSuccess('User deleted successfully');
       fetchAllUsers();
     } catch {
       setError('Failed to delete user');
     }
   }
 };
 return (
<div>
<h3>{showAdminProfile ? 'My Profile' : 'User Management'}</h3>
     {error && <Alert variant="danger">{error}</Alert>}
     {success && <Alert variant="success">{success}</Alert>}
     {!showAdminProfile && !form && (
<>
<Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
<option value="">-- Filter by Role --</option>
<option value="Admin">Admin</option>
<option value="Doctor">Doctor</option>
<option value="Patient">Patient</option>
</Form.Select>
<Button onClick={fetchUsersByRole} className="mt-2 mb-3">Search</Button>
<Table striped bordered>
<thead>
<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
</thead>
<tbody>
             {users.map((user) => (
<tr key={user.userId}>
<td>{user.userId}</td>
<td>{user.name}</td>
<td>{user.email}</td>
<td>{user.role}</td>
<td>
<Button variant="info" size="sm" onClick={() => setForm(user)}>Edit</Button>{' '}
<Button variant="danger" size="sm" onClick={() => handleDelete(user.userId)}>Delete</Button>
</td>
</tr>
             ))}
</tbody>
</Table>
</>
     )}
     {form && (
<Form>
         {Object.entries(form).map(([key, value]) =>
           key !== "userId" && (
<Form.Group key={key} className="mb-2">
<Form.Label>{key}</Form.Label>
<Form.Control
                 type={key === "password" ? "password" : "text"}
                 name={key}
                 value={value}
                 onChange={handleChange}
               />
</Form.Group>
           )
         )}
<Button onClick={handleUpdate}>Update</Button>
</Form>
     )}
</div>
 );
};
export default UserManagement;