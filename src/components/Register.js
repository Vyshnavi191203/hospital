import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
const Register = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const validate = () => {
    let validationErrors = {};
    if (!form.name.trim()) validationErrors.name = 'Name is required';
    if (!form.role) validationErrors.role = 'Role is required';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) validationErrors.email = 'Valid email is required';
    if (!form.age || Number(form.age) <= 0) validationErrors.age = 'Enter valid age';
    if (!form.phone || !/^\d{10}$/.test(form.phone)) validationErrors.phone = 'Enter valid 10-digit phone number';
    if (!form.address.trim()) validationErrors.address = 'Address is required';
    if (!form.password || form.password.length < 6) validationErrors.password = 'Password must be at least 6 characters';
    return validationErrors;
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('');
      return;
    }
    try {
      await axios.post('https://localhost:7166/api/Users', form);
      setMessage('Registration successful!');
      setForm({
        name: '', role: '', email: '', age: '', phone: '', address: '', password: ''
      });
      setErrors({});
      if (onRegisterSuccess) onRegisterSuccess(); // Switch to login
    } catch {
      setMessage('Registration failed. Try again.');
    }
  };
  return (
<Container className="mt-5">
<h2>Register</h2>
      {message && <Alert variant="info">{message}</Alert>}
<Form onSubmit={handleRegister}>
<Form.Group controlId="name">
<Form.Label>Name</Form.Label>
<Form.Control type="text" name="name" value={form.name} onChange={handleChange} isInvalid={!!errors.name} />
<Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="role">
<Form.Label>Role</Form.Label>
<Form.Select name="role" value={form.role} onChange={handleChange} isInvalid={!!errors.role}>
<option value="">Select Role</option>
<option value="Patient">Patient</option>
<option value="Doctor">Doctor</option>
</Form.Select>
<Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="email">
<Form.Label>Email</Form.Label>
<Form.Control type="email" name="email" value={form.email} onChange={handleChange} isInvalid={!!errors.email} />
<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="age">
<Form.Label>Age</Form.Label>
<Form.Control type="number" name="age" value={form.age} onChange={handleChange} isInvalid={!!errors.age} />
<Form.Control.Feedback type="invalid">{errors.age}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="phone">
<Form.Label>Phone</Form.Label>
<Form.Control type="text" name="phone" value={form.phone} onChange={handleChange} isInvalid={!!errors.phone} />
<Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="address">
<Form.Label>Address</Form.Label>
<Form.Control type="text" name="address" value={form.address} onChange={handleChange} isInvalid={!!errors.address} />
<Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
</Form.Group>
<Form.Group controlId="password">
<Form.Label>Password</Form.Label>
<Form.Control type="password" name="password" value={form.password} onChange={handleChange} isInvalid={!!errors.password} />
<Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
</Form.Group>
<Button variant="primary" type="submit" className="mt-3">Register</Button>
</Form>
</Container>
  );
};
export default Register;