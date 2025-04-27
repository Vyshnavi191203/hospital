import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './auth.css';
const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const handleRegisterSuccess = () => {
    setShowLogin(true); // Switch to login after successful registration
  };
  return (
<div className="auth-container">
<div className="auth-box">
        {showLogin ? <Login /> : <Register onRegisterSuccess={handleRegisterSuccess} />}
<p className="toggle-text">
          {showLogin ? 'New user?' : 'Already have an account?'}{' '}
<span onClick={() => setShowLogin(!showLogin)} style={{ cursor: 'pointer', color: '#007bff' }}>
            {showLogin ? 'Register here' : 'Login here'}
</span>
</p>
</div>
</div>
  );
};
export default Auth;