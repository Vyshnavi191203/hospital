import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
 
const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
 
  const fetchRole = async (identifier) => {
    try {
      const response = await axios.get(`https://localhost:7166/api/Auth/getRole/${identifier}`);
      return response.data.role;
    } catch (err) {
      console.error(err);
      setError('Failed to fetch role. Check backend connection.');
      return null;
    }
  };
 
  const handleLogin = async (e) => {

    e.preventDefault();
  
    const fetchedRole = await fetchRole(identifier);
  
    if (!fetchedRole) {
  
      setError('Invalid identifier');
  
      return;
  
    }
  
    try {
  
      const response = await axios.post('https://localhost:7166/api/Auth/login', {
  
        identifier,
  
        password,
  
        role: fetchedRole,
  
      });
  
      const token = response.data.token;
  
      localStorage.setItem('token', token);
  
      localStorage.setItem('role', fetchedRole);
  
      localStorage.setItem('identifier', identifier);
  
      // NEW: Fetch user details to get name
  
      const userRes = await axios.get(`https://localhost:7166/api/Users/search?identifier=${identifier}`, {
  
        headers: { Authorization: `Bearer ${token}` }
  
      });
  
      const userName = userRes.data.name;
  
      const userId = userRes.data.userId;
  
      localStorage.setItem('name', userName);  // Save Doctor Name
  
      localStorage.setItem('userId', userId);  // (Optional but useful)
  
      setSuccess('Login successful!');
  
      setError('');
  
      setTimeout(() => {
  
        if (fetchedRole === 'Admin') {
  
          navigate('/admin');
  
        } else if (fetchedRole === 'Doctor') {
  
          navigate('/doctor');
  
        } else if (fetchedRole === 'Patient') {
  
          navigate('/patient');
  
        }
  
      }, 2000);
  
    } catch (err) {
  
      console.error(err);
  
      if (err.response && err.response.status === 401) {
  
        setError('Invalid credentials');
  
      } else {
  
        setError('Something went wrong. Check backend connection.');
  
      }
  
    }
  
  }; 
  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4 text-center">Login</h2>
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>User ID or Email:</Form.Label>
          <Form.Control
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </Form.Group>
 
        <Form.Group className="mb-3">
          <Form.Label>Password:</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
 
        <Button type="submit" className="btn btn-primary w-100">
          Login
        </Button>
 
        {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="text-center mt-3">{success}</Alert>}
      </Form>
    </Container>
  );
};
 
export default Login;