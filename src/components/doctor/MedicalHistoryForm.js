import React, { useState, useEffect } from 'react';
import axios from 'axios';


const MedicalHistoryForm = () => {
  const [histories, setHistories] = useState([]);
  const [patients, setPatients] = useState([]);

  const [addForm, setAddForm] = useState({
    historyID: '',
    userId: '',
    diagnosis: '',
    treatment: '',
    dateOfVisit: ''
  });

  const [editForm, setEditForm] = useState({
    historyID: '',
    diagnosis: '',
    treatment: '',
    dateOfVisit: '',
    patientId: ''
  });

  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const baseUrl = 'https://localhost:7166/api/MedicalHistory';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPatients();
    fetchHistories(currentPage, pageSize);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`https://localhost:7166/api/Users/by-role?role=patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch {
      alert("Failed to fetch patients");
    }
  };

  const fetchHistories = async (page = 1, size = pageSize) => {
    try {
      const res = await axios.get(`${baseUrl}/paged?pageNumber=${page}&pageSize=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistories(res.data.data);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(Math.ceil(res.data.totalRecords / size));
      setCurrentPage(page);
    } catch (err) {
      alert('Error fetching histories');
    }
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async () => {
    try {
      const payload = {
        historyID: parseInt(addForm.historyID),
        diagnosis: addForm.diagnosis,
        treatment: addForm.treatment,
        dateOfVisit: addForm.dateOfVisit
      };
      await axios.post(`${baseUrl}?userId=${addForm.userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Medical history added!');
      setAddForm({ historyID: '', userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });
      fetchHistories(1, pageSize);
    } catch (err) {
      alert('Add Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        historyID: parseInt(editForm.historyID),
        diagnosis: editForm.diagnosis,
        treatment: editForm.treatment,
        dateOfVisit: editForm.dateOfVisit,
        patientId: editForm.patientId
      };
      await axios.put(`${baseUrl}/${editForm.historyID}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Medical history updated!');
      setEditForm({ historyID: '', diagnosis: '', treatment: '', dateOfVisit: '', patientId: '' });
      fetchHistories(currentPage, pageSize);
    } catch (err) {
      alert('Update Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const populateEditForm = (history) => {
    setEditForm({
      historyID: history.historyID,
      diagnosis: history.diagnosis,
      treatment: history.treatment,
      dateOfVisit: history.dateOfVisit,
      patientId: history.patientId
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistories(currentPage, pageSize);
    } catch (err) {
      alert('Delete Error: ' + err.message);
    }
  };

  const handleSearch = async (type, value) => {
    try {
      const res = await axios.get(`${baseUrl}/search/${type}?${type}=${value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistories(res.data);
    } catch (err) {
      alert('Search Error: ' + err.message);
    }
  };

  const handleDateSearch = async () => {
    if (!dateSearch) {
      alert('Please select a date.');
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/search/date?dateOfVisit=${dateSearch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistories(res.data);
    } catch (err) {
      alert('Date Search Error: ' + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Doctor - Medical History</h3>

      {/* Add Form */}
      <h5 className="mt-4">Add Medical History</h5>
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <input name="historyID" type="number" className="form-control" placeholder="History ID"
            value={addForm.historyID} onChange={handleAddChange} required />
        </div>
        <div className="col-md-2">
          <select name="userId" className="form-control" value={addForm.userId} onChange={handleAddChange}>
            <option value="">Select Patient</option>
            {patients.map(p => (
              <option key={p.userId} value={p.userId}>{`${p.userId} - ${p.name}`}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input name="diagnosis" className="form-control" placeholder="Diagnosis"
            value={addForm.diagnosis} onChange={handleAddChange} required />
        </div>
        <div className="col-md-2">
          <input name="treatment" className="form-control" placeholder="Treatment"
            value={addForm.treatment} onChange={handleAddChange} required />
        </div>
        <div className="col-md-2">
          <input name="dateOfVisit" type="date" className="form-control"
            value={addForm.dateOfVisit} onChange={handleAddChange} required />
        </div>
        <div className="col-md-2">
          <button onClick={handleAddSubmit} className="btn btn-success w-100">Add</button>
        </div>
      </div>

      {/* Edit Form */}
      <h5>Update Medical History</h5>
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <input name="historyID" type="number" className="form-control" placeholder="History ID"
            value={editForm.historyID} onChange={handleEditChange} readOnly />
        </div>
        <div className="col-md-2">
          <input name="patientId" className="form-control" placeholder="Patient ID"
            value={editForm.patientId} onChange={handleEditChange} />
        </div>
        <div className="col-md-2">
          <input name="diagnosis" className="form-control" placeholder="Diagnosis"
            value={editForm.diagnosis} onChange={handleEditChange} />
        </div>
        <div className="col-md-2">
          <input name="treatment" className="form-control" placeholder="Treatment"
            value={editForm.treatment} onChange={handleEditChange} />
        </div>
        <div className="col-md-2">
          <input name="dateOfVisit" type="date" className="form-control"
            value={editForm.dateOfVisit} onChange={handleEditChange} />
        </div>
        <div className="col-md-2">
          <button onClick={handleEditSubmit} className="btn btn-primary w-100">Update</button>
        </div>
      </div>

      {/* Search */}
      <h5>Search Medical History</h5>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input className="form-control" placeholder="Diagnosis"
            value={diagnosisSearch} onChange={(e) => setDiagnosisSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-info w-100" onClick={() => handleSearch('diagnosis', diagnosisSearch)}>Search Diagnosis</button>
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Treatment"
            value={treatmentSearch} onChange={(e) => setTreatmentSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-info w-100" onClick={() => handleSearch('treatment', treatmentSearch)}>Search Treatment</button>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control"
            value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} />
          <button className="btn btn-info mt-1 w-100" onClick={handleDateSearch}>Search Date</button>
        </div>
      </div>

      {/* Table */}
      <h5>History Records</h5>
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
                <button onClick={() => populateEditForm(h)} className="btn btn-info btn-sm me-2">Edit</button>
                <button onClick={() => handleDelete(h.historyID)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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

export default MedicalHistoryForm;
