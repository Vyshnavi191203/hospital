import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminmodules.css';
 
const MedicalHistoryAdmin = () => {
  const token = localStorage.getItem('token');
  const API_BASE = 'https://localhost:7166/api';
 
  const [histories, setHistories] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ historyID: '', userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState({ diagnosis: '', treatment: '', date: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
 
  useEffect(() => {
    fetchHistories(page, pageSize);
    fetchPatients();
  }, []);
 
  const fetchHistories = async (pageNumber = 1, size = pageSize) => {
    try {
      const res = await axios.get(`${API_BASE}/MedicalHistory/paged?pageNumber=${pageNumber}&pageSize=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(res.data.data);
      setTotalRecords(res.data.totalRecords);
      setPage(pageNumber);
    } catch (err) {
      alert('Fetch error');
    }
  };
 
  const fetchPatients = async () => {
    const res = await axios.get(`${API_BASE}/Users/by-role?role=patient`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPatients(res.data);
  };
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE}/MedicalHistory?userId=${form.userId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Added successfully');
      setForm({ historyID: '', userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });
      fetchHistories(1, pageSize);
    } catch (err) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };
 
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/MedicalHistory/${form.historyID}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Updated successfully');
      setForm({ historyID: '', userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });
      setEditMode(false);
      fetchHistories(page, pageSize);
    } catch (err) {
      alert('Update failed');
    }
  };
 
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        await axios.delete(`${API_BASE}/MedicalHistory/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchHistories(page, pageSize);
      } catch {
        alert('Delete failed');
      }
    }
  };
 
  const loadToEdit = (record) => {
    setForm(record);
    setEditMode(true);
  };
 
  const handleSearch = async (type, value) => {
    try {
      const res = await axios.get(`${API_BASE}/MedicalHistory/search/${type}?${type}=${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(res.data);
    } catch {
      alert('Search failed');
    }
  };
 
  const handleDateSearch = async () => {
    if (!search.date) return;
    try {
      const res = await axios.get(`${API_BASE}/MedicalHistory/search/date?dateOfVisit=${search.date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(res.data);
    } catch {
      alert('Date search failed');
    }
  };
 
  const totalPages = Math.ceil(totalRecords / pageSize);
 
  return (
<div className="container mt-4">
<h3>Medical History Admin</h3>
 
      {/* Add/Edit Form */}
<div className="row mb-3">
<div className="col-md-2">
<input name="historyID" value={form.historyID} onChange={handleChange} className="form-control" placeholder="History ID" />
</div>
<div className="col-md-2">
<select name="userId" value={form.userId} onChange={handleChange} className="form-control">
<option value="">Select Patient</option>
            {patients.map((p) => (
<option key={p.userId} value={p.userId}>{`${p.userId} - ${p.name}`}</option>
            ))}
</select>
</div>
<div className="col-md-2">
<input name="diagnosis" value={form.diagnosis} onChange={handleChange} className="form-control" placeholder="Diagnosis" />
</div>
<div className="col-md-2">
<input name="treatment" value={form.treatment} onChange={handleChange} className="form-control" placeholder="Treatment" />
</div>
<div className="col-md-2">
<input name="dateOfVisit" type="date" value={form.dateOfVisit?.split('T')[0] || ''} onChange={handleChange} className="form-control" />
</div>
<div className="col-md-2">
          {editMode ? (
<button onClick={handleUpdate} className="btn btn-primary w-100">Update</button>
          ) : (
<button onClick={handleSubmit} className="btn btn-success w-100">Add</button>
          )}
</div>
</div>
 
      {/* Search */}
<div className="row mb-4">
<div className="col-md-3">
<input value={search.diagnosis} onChange={(e) => setSearch({ ...search, diagnosis: e.target.value })} className="form-control" placeholder="Search Diagnosis" />
</div>
<div className="col-md-2">
<button className="btn btn-info w-100" onClick={() => handleSearch('diagnosis', search.diagnosis)}>Search</button>
</div>
<div className="col-md-3">
<input value={search.treatment} onChange={(e) => setSearch({ ...search, treatment: e.target.value })} className="form-control" placeholder="Search Treatment" />
</div>
<div className="col-md-2">
<button className="btn btn-info w-100" onClick={() => handleSearch('treatment', search.treatment)}>Search</button>
</div>
<div className="col-md-2">
<input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} className="form-control" />
<button className="btn btn-secondary mt-1 w-100" onClick={handleDateSearch}>Search Date</button>
</div>
</div>
 
      {/* Table */}
<table className="table table-bordered">
<thead className="table-dark">
<tr><th>ID</th><th>Diagnosis</th><th>Treatment</th><th>Date</th><th>Actions</th></tr>
</thead>
<tbody>
          {histories.map((h) => (
<tr key={h.historyID}>
<td>{h.historyID}</td>
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
<div className="d-flex justify-content-between align-items-center">
<div>
<label>Page Size:</label>
<select value={pageSize} onChange={(e) => {
            const newSize = parseInt(e.target.value);
            setPageSize(newSize);
            fetchHistories(1, newSize);
          }} className="form-select d-inline w-auto ms-2">
<option value={5}>5</option>
<option value={10}>10</option>
<option value={15}>15</option>
</select>
</div>
<div>
<button className="btn btn-secondary me-2" disabled={page === 1} onClick={() => fetchHistories(page - 1, pageSize)}>Previous</button>
          Page {page} of {totalPages}
<button className="btn btn-secondary ms-2" disabled={page === totalPages} onClick={() => fetchHistories(page + 1, pageSize)}>Next</button>
</div>
<div>
<strong>Total Records: {totalRecords}</strong>
</div>
</div>
</div>
  );
};
 
export default MedicalHistoryAdmin;