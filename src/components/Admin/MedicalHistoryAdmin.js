import React, { useEffect, useState } from 'react';

import axios from 'axios';

import './adminmodules.css';
import {toast} from 'react-toastify';

const MedicalHistoryAdmin = () => {

  const token = localStorage.getItem('token');

  const API_BASE = 'https://localhost:7166/api';

  const [histories, setHistories] = useState([]);

  const [patients, setPatients] = useState([]);

  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({ userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });

  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState({ diagnosis: '', treatment: '', date: '', patientId: '', doctorName: '' });

  const [patientMap, setPatientMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(5);
const [totalRecords, setTotalRecords] = useState(0);
const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {

    fetchHistories();

    fetchPatients();

    fetchDoctors();

  }, []);

  const fetchHistories = async (page = 1, size = pageSize) => {
    try {
      const res = await axios.get(`${API_BASE}/MedicalHistory/paged?pageNumber=${page}&pageSize=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistories(res.data.data);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(Math.ceil(res.data.totalRecords / size));
      setCurrentPage(page);
    } catch {
      alert('Fetch error');
    }
   };

  const fetchPatients = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Users/by-role?role=patient`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setPatients(res.data);

      const mapping = {};

      res.data.forEach(p => {

        mapping[p.userId] = p.name;

      });

      setPatientMap(mapping);

    } catch {

      toast.error('Failed to fetch patients');

    }

  };

  const fetchDoctors = async () => {

    try {

      const res = await axios.get(`${API_BASE}/Users/by-role?role=doctor`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setDoctors(res.data);

    } catch {

      toast.error('Failed to fetch doctors');

    }

  };

  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };
  const generateRandomHistoryID = () => {
    const digits = Math.random() < 0.5 ? 3 : 4;
    if (digits === 3) {
      return Math.floor(100 + Math.random() * 900);
    } else {
      return Math.floor(1000 + Math.random() * 9000);
    }
  };
  const handleSubmit = async () => {

    try {
  
      const randomHistoryID = generateRandomHistoryID(); // You should have this function
  
      const adminName = localStorage.getItem('name');
  
      const payload = {
  
        historyID: randomHistoryID,
  
        diagnosis: form.diagnosis,
  
        treatment: form.treatment,
        DoctorNames:adminName,
  
        dateOfVisit: form.dateOfVisit
  
      };
  
      await axios.post(`${API_BASE}/MedicalHistory?userId=${form.userId}&doctorName=${adminName}`, payload, {
  
        headers: { Authorization: `Bearer ${token}` }
  
      });
  
      toast.success('Medical history added successfully!');
  
      resetForm();
  
      fetchHistories();
  
    } catch (error) {
  
      console.error(error.response?.data || error.message);
  
    toast.error('Add failed');
  
    }
  
  }; 
  const handleUpdate = async () => {
    try {
      const adminName = localStorage.getItem('name');
      const payload = {
        historyID: form.historyID,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        dateOfVisit: form.dateOfVisit,
        doctorNames: adminName // Very Important to send doctorNames in Body
      };
      await axios.put(`${API_BASE}/MedicalHistory/${form.historyID}?userId=${form.userId}&doctorName=${adminName}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Updated successfully!');
      resetForm();
      fetchHistories();
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Update failed');
    }
   };

  const handleDelete = async (id) => {

    if (window.confirm('Are you sure to delete?')) {

      try {

        await axios.delete(`${API_BASE}/MedicalHistory/${id}`, {

          headers: { Authorization: `Bearer ${token}` }

        });

        fetchHistories();

      } catch {

        toast.error('Delete failed');

      }

    }

  };

  const resetForm = () => {

    setForm({ userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });

    setEditMode(false);

  };

  const loadToEdit = (record) => {

    setForm({

      historyID: record.historyID,

      userId: record.patientId,

      diagnosis: record.diagnosis,

      treatment: record.treatment,

      dateOfVisit: record.dateOfVisit ? record.dateOfVisit.split('T')[0] : ''

    });

    setEditMode(true);

  };

  const handleSearchByDiagnosis = async () => {

    try {

      const res = await axios.get(`${API_BASE}/MedicalHistory/search/diagnosis?diagnosis=${search.diagnosis}`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setHistories(res.data);

    } catch {

      toast.error('Diagnosis search failed');

    }

  };

  const handleSearchByTreatment = async () => {

    try {

      const res = await axios.get(`${API_BASE}/MedicalHistory/search/treatment?treatment=${search.treatment}`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setHistories(res.data);

    } catch {

      toast.error('Treatment search failed');

    }

  };

  const handleSearchByDate = async () => {

    try {

      const res = await axios.get(`${API_BASE}/MedicalHistory/search/date?dateOfVisit=${search.date}`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setHistories(res.data);

    } catch {

      toast.error('Date search failed');

    }

  };

  const handleSearchByPatient = async () => {

    try {

      const res = await axios.get(`${API_BASE}/MedicalHistory/by-patient/${search.patientId}`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setHistories(res.data);

    } catch {

      toast.error('Patient search failed');

    }

  };

  const handleSearchByDoctor = async () => {

    try {

      const res = await axios.get(`${API_BASE}/MedicalHistory/search/doctor-name?doctorName=${search.doctorName}`, {

        headers: { Authorization: `Bearer ${token}` }

      });

      setHistories(res.data);

    } catch {

      toast.error('Doctor search failed');

    }

  };

  return (
<div className="container mt-4">
<h3>Medical History Management</h3>

      {/* Add/Edit Form */}
<div className="row mb-3">
<div className="col-md-3">
<select name="userId" value={form.userId} onChange={handleChange} className="form-control">
<option value="">Select Patient</option>

            {patients.map((p) => (
<option key={p.userId} value={p.userId}>{p.name}</option>

            ))}
</select>
</div>
<div className="col-md-3">
<input name="diagnosis" value={form.diagnosis} onChange={handleChange} className="form-control" placeholder="Diagnosis" />
</div>
<div className="col-md-3">
<input name="treatment" value={form.treatment} onChange={handleChange} className="form-control" placeholder="Treatment" />
</div>
<div className="col-md-3">
<input name="dateOfVisit" type="date" value={form.dateOfVisit} onChange={handleChange} className="form-control" />
</div>
<div className="col-md-3 mt-2">

          {editMode ? (
<button className="btn btn-primary w-100" onClick={handleUpdate}>Update</button>

          ) : (
<button className="btn btn-success w-100" onClick={handleSubmit}>Add</button>

          )}
</div>
</div>

      {/* Search Section */}
<div className="row mb-3">
<div className="col-md-3">
<input value={search.diagnosis} onChange={(e) => setSearch({ ...search, diagnosis: e.target.value })} className="form-control" placeholder="Search Diagnosis" />
<button className="btn btn-info mt-1 w-100" onClick={handleSearchByDiagnosis}>Search</button>
</div>
<div className="col-md-3">
<input value={search.treatment} onChange={(e) => setSearch({ ...search, treatment: e.target.value })} className="form-control" placeholder="Search Treatment" />
<button className="btn btn-info mt-1 w-100" onClick={handleSearchByTreatment}>Search</button>
</div>
<div className="col-md-3">
<input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} className="form-control" />
<button className="btn btn-info mt-1 w-100" onClick={handleSearchByDate}>Search</button>
</div>
<div className="col-md-3">
<select value={search.patientId} onChange={(e) => setSearch({ ...search, patientId: e.target.value })} className="form-control">
<option value="">Search by Patient</option>

            {patients.map(p => (
<option key={p.userId} value={p.userId}>{p.name}</option>

            ))}
</select>
<button className="btn btn-info mt-1 w-100" onClick={handleSearchByPatient}>Search</button>
</div>
<div className="col-md-3">
<select value={search.doctorName} onChange={(e) => setSearch({ ...search, doctorName: e.target.value })} className="form-control">
<option value="">Search by Doctor</option>

            {doctors.map(d => (
<option key={d.userId} value={d.name}>{d.name}</option>

            ))}
</select>
<button className="btn btn-info mt-1 w-100" onClick={handleSearchByDoctor}>Search</button>
</div>
</div>

      {/* Table */}
<table className="table table-bordered">
<thead className="table-dark">
<tr>
<th>Patient Name</th>
<th>Doctor Name</th>
<th>Diagnosis</th>
<th>Treatment</th>
<th>Date</th>
<th>Actions</th>
</tr>
</thead>
<tbody>

  {histories.map((h) => (
<tr key={h.historyID}>
<td>{patientMap[h.patientId] || h.patientId}</td>
<td>{h.doctorNames}</td>
<td>{h.diagnosis}</td>
<td>{h.treatment}</td>
<td>{h.dateOfVisit?.split('T')[0]}</td>
<td>
<button className="btn btn-info btn-sm me-2" onClick={() => loadToEdit(h)}>Edit</button>
<button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.historyID)}>Delete</button>
</td>
</tr>

  ))}
</tbody> 
</table>
{/* Pagination Controls */}
<div className="d-flex justify-content-between align-items-center mt-3">
<div>
<label>Page Size:&nbsp;</label>
<select value={pageSize} onChange={(e) => {

      const newSize = parseInt(e.target.value);

      setPageSize(newSize);

      fetchHistories(1, newSize);

    }}>
<option value={5}>5</option>
<option value={10}>10</option>
<option value={15}>15</option>
</select>
</div>
<div>
<button className="btn btn-secondary me-2" disabled={currentPage === 1}

      onClick={() => fetchHistories(currentPage - 1, pageSize)}>Previous</button>

    Page {currentPage} of {totalPages}
<button className="btn btn-secondary ms-2" disabled={currentPage === totalPages}

      onClick={() => fetchHistories(currentPage + 1, pageSize)}>Next</button>
</div>
<div>
<strong>Total Records: {totalRecords}</strong>
</div>
</div> 
</div>

  );

};

export default MedicalHistoryAdmin; 