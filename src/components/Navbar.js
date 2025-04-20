import React from 'react';

import { Link, useNavigate } from 'react-router-dom';

import './navbar.css';

const Navbar = ({ toggleSidebar }) => {

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const role = localStorage.getItem('role');

  const handleLogoClick = () => {

    if (token) {

      if (role === 'doctor') navigate('/doctor');

      else if (role === 'admin') navigate('/admin');

      else if (role === 'patient') navigate('/patient');

      else navigate('/');

    } else {

      navigate('/');

    }

  };

  return (
<nav className="navbar">
<div className="navbar-left">

        {token && (
<button className="toggle-sidebar-btn" onClick={toggleSidebar}>☰</button>

        )}
<button className="navbar-logo-btn" onClick={handleLogoClick}>Hospice</button>
</div>
<ul className="nav-links">
<li><Link to="/departments">Department</Link></li>
<li><Link to="/about">About Us</Link></li>
<li><Link to="/contact">Contact Us</Link></li>

        {!token && <li><Link to="/auth">Login</Link></li>}
</ul>
</nav>

  );

};

export default Navbar; 