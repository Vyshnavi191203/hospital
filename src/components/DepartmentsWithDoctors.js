import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DepartmentCard from './DepartmentCard';
import DoctorCard from './DoctorCard';
import './DepartmentsWithDoctors.css';

const API = 'https://localhost:7166/api';

const DepartmentsWithDoctors = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/Appointment/all-departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchDoctors = async (dept) => {
    setSelectedDept(dept);
    try {
      const res = await axios.get(`${API}/Appointment/doctors-by-department?department=${dept}`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  return (
    <div className="dept-page">
      <div className="dept-header">
        <h2>{selectedDept ? `${selectedDept} Doctors` : 'Departments'}</h2>
      </div>
      <div className="dept-container">
        <div className="dept-sidebar">
          <h4>Specialty</h4>
          <select onChange={(e) => fetchDoctors(e.target.value)} value={selectedDept}>
            <option value="">-- Select Department --</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div className="dept-content">
          {!selectedDept ? (
            <div className="card-grid">
              {departments.map((dept, index) => (
                <DepartmentCard key={index} department={dept} onClick={fetchDoctors} />
              ))}
            </div>
          ) : (
            <div className="card-grid">
              {doctors.map((doc, index) => (
                <DoctorCard key={index} doctor={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsWithDoctors;
