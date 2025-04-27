import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
const MedicalHistoryForm = () => {
 const [histories, setHistories] = useState([]);
 const [patients, setPatients] = useState([]);
 const [doctors, setDoctors] = useState([]);
 const [addForm, setAddForm] = useState({
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
   patientId: '',
   doctorNames: ''
 });
 const [diagnosisSearch, setDiagnosisSearch] = useState('');
 const [treatmentSearch, setTreatmentSearch] = useState('');
 const [dateSearch, setDateSearch] = useState('');
 const [selectedPatientId, setSelectedPatientId] = useState('');
 const [selectedDoctorName, setSelectedDoctorName] = useState('');
 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(5);
 const [totalRecords, setTotalRecords] = useState(0);
 const [totalPages, setTotalPages] = useState(1);
 const baseUrl = 'https://localhost:7166/api/MedicalHistory';
 const token = localStorage.getItem('token');
 useEffect(() => {
   fetchPatients();
   fetchDoctors();
   fetchHistories(currentPage, pageSize);
 }, []);
 const fetchPatients = async () => {
   try {
     const res = await axios.get(`https://localhost:7166/api/Users/by-role?role=patient`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setPatients(res.data);
   } catch {
     toast.error("Failed to fetch patients");
   }
 };
 const fetchDoctors = async () => {
   try {
     const res = await axios.get(`https://localhost:7166/api/Users/by-role?role=doctor`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setDoctors(res.data);
   } catch {
     toast.error("Failed to fetch doctors");
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
     toast.error('Error fetching histories');
   }
 };
 const generateRandomHistoryID = () => {
   const digits = Math.random() < 0.5 ? 3 : 4;
   if (digits === 3) {
     return Math.floor(100 + Math.random() * 900);
   } else {
     return Math.floor(1000 + Math.random() * 9000);
   }
 };
 const handleAddChange = (e) => {
   setAddForm({ ...addForm, [e.target.name]: e.target.value });
 };
 const handleAddSubmit = async () => {
   try {
     const randomHistoryID = generateRandomHistoryID();
     const loggedInDoctorName = localStorage.getItem('name');
     const payload = {
       historyID: randomHistoryID,
       diagnosis: addForm.diagnosis,
       treatment: addForm.treatment,
       dateOfVisit: addForm.dateOfVisit,
       doctorNames: loggedInDoctorName
     };
     await axios.post(`${baseUrl}?userId=${addForm.userId}&doctorName=${loggedInDoctorName}`, payload, {
       headers: { Authorization: `Bearer ${token}` }
     });
     toast.success('Medical history added successfully!');
     setAddForm({ userId: '', diagnosis: '', treatment: '', dateOfVisit: '' });
     fetchHistories(1, pageSize);
   } catch (err) {
     toast.error('Add Error: ' + (err.response?.data?.message || err.message));
   }
 };
 const handleEditChange = (e) => {
   setEditForm({ ...editForm, [e.target.name]: e.target.value });
 };
 const handleEditSubmit = async () => {
   try {
     const loggedInDoctorName = localStorage.getItem('name');
     const payload = {
       historyID: parseInt(editForm.historyID),
       diagnosis: editForm.diagnosis,
       treatment: editForm.treatment,
       dateOfVisit: editForm.dateOfVisit,
       patientId: editForm.patientId,
       doctorNames: editForm.doctorNames
     };
     await axios.put(`${baseUrl}/${editForm.historyID}?doctorName=${loggedInDoctorName}`, payload, {
       headers: { Authorization: `Bearer ${token}` }
     });
     toast.success('Medical history updated successfully!');
     setEditForm({ historyID: '', diagnosis: '', treatment: '', dateOfVisit: '', patientId: '', doctorNames: '' });
     fetchHistories(currentPage, pageSize);
   } catch (err) {
     toast.error('Update Error: ' + (err.response?.data?.message || err.message));
   }
 };
 const populateEditForm = (history) => {
   setEditForm({
     historyID: history.historyID,
     diagnosis: history.diagnosis,
     treatment: history.treatment,
     dateOfVisit: history.dateOfVisit,
     patientId: history.patientId,
     doctorNames: history.doctorNames
   });
 };
 const handleDelete = async (id) => {
   try {
     await axios.delete(`${baseUrl}/${id}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     fetchHistories(currentPage, pageSize);
   } catch (err) {
     toast.error('Delete Error: ' + err.message);
   }
 };
 const handleDiagnosisSearch = async () => {
   try {
     const res = await axios.get(`${baseUrl}/search/diagnosis?diagnosis=${diagnosisSearch}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setHistories(res.data);
   } catch (err) {
     toast.error('Diagnosis Search Error: ' + err.message);
   }
 };
 const handleTreatmentSearch = async () => {
   try {
     const res = await axios.get(`${baseUrl}/search/treatment?treatment=${treatmentSearch}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setHistories(res.data);
   } catch (err) {
     toast.error('Treatment Search Error: ' + err.message);
   }
 };
 const handleDateSearch = async () => {
   if (!dateSearch) {
     toast.error('Please select a date.');
     return;
   }
   try {
     const res = await axios.get(`${baseUrl}/search/date?dateOfVisit=${dateSearch}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setHistories(res.data);
   } catch (err) {
     toast.error('Date Search Error: ' + err.message);
   }
 };
 const handlePatientDropdownSearch = async () => {
   if (!selectedPatientId) {
     toast.error('Please select a patient.');
     return;
   }
   try {
     const res = await axios.get(`${baseUrl}/by-patient/${selectedPatientId}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setHistories(res.data);
   } catch (err) {
     toast.error('Patient Dropdown Search Error: ' + err.message);
   }
 };
 const handleDoctorDropdownSearch = async () => {
   if (!selectedDoctorName) {
     toast.error('Please select a doctor.');
     return;
   }
   try {
     const res = await axios.get(`${baseUrl}/search/doctor-name?doctorName=${selectedDoctorName}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setHistories(res.data);
   } catch (err) {
     toast.error('Doctor Dropdown Search Error: ' + err.message);
   }
 };
 return (
<div className="container mt-4">
<h3>Doctor - Medical History</h3>
     {/* Add Form */}
<h5 className="mt-4">Add Medical History</h5>
<div className="row g-3 mb-4">
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
     {/* Search Section */}
<h5>Search Medical History</h5>
<div className="row g-2 mb-3">
<div className="col-md-3">
<input className="form-control" placeholder="Diagnosis" value={diagnosisSearch} onChange={(e) => setDiagnosisSearch(e.target.value)} />
</div>
<div className="col-md-2">
<button className="btn btn-info w-100" onClick={handleDiagnosisSearch}>Search Diagnosis</button>
</div>
<div className="col-md-3">
<input className="form-control" placeholder="Treatment" value={treatmentSearch} onChange={(e) => setTreatmentSearch(e.target.value)} />
</div>
<div className="col-md-2">
<button className="btn btn-info w-100" onClick={handleTreatmentSearch}>Search Treatment</button>
</div>
<div className="col-md-2">
<input type="date" className="form-control" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} />
<button className="btn btn-info mt-1 w-100" onClick={handleDateSearch}>Search Date</button>
</div>
</div>
     {/* Patient/Doctor Dropdown Search */}
<div className="row g-2 mb-4">
<div className="col-md-4">
<select className="form-control" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
<option value="">Select Patient</option>
           {patients.map(p => (
<option key={p.userId} value={p.userId}>{p.name}</option>
           ))}
</select>
</div>
<div className="col-md-2">
<button className="btn btn-primary w-100" onClick={handlePatientDropdownSearch}>Search by Patient</button>
</div>
<div className="col-md-4">
<select className="form-control" value={selectedDoctorName} onChange={(e) => setSelectedDoctorName(e.target.value)}>
<option value="">Select Doctor</option>
           {doctors.map(d => (
<option key={d.userId} value={d.name}>{d.name}</option>
           ))}
</select>
</div>
<div className="col-md-2">
<button className="btn btn-primary w-100" onClick={handleDoctorDropdownSearch}>Search by Doctor</button>
</div>
</div>
{/* Edit Form */}

{editForm.historyID && (
<div className="mt-5">
<h5>Edit Medical History</h5>
<div className="row g-3 mb-4">
<div className="col-md-3">
<input

          name="diagnosis"

          className="form-control"

          placeholder="Diagnosis"

          value={editForm.diagnosis}

          onChange={handleEditChange}

        />
</div>
<div className="col-md-3">
<input

          name="treatment"

          className="form-control"

          placeholder="Treatment"

          value={editForm.treatment}

          onChange={handleEditChange}

        />
</div>
<div className="col-md-3">
<input

          name="dateOfVisit"

          type="date"

          className="form-control"

          value={editForm.dateOfVisit?.split('T')[0]} 

          onChange={handleEditChange}

        />
</div>
<div className="col-md-3">
<button onClick={handleEditSubmit} className="btn btn-primary w-100 mb-2">Save Changes</button>
<button onClick={() => setEditForm({ historyID: '', diagnosis: '', treatment: '', dateOfVisit: '', patientId: '', doctorNames: '' })} className="btn btn-secondary w-100">Cancel</button>
</div>
</div>
</div>

)} 
     {/* History Table */}
<h5>History Records</h5>
     {/* Table code continues here... */}
     {/* History Table */}
<table className="table table-bordered">
<thead className="table-dark">
<tr>
<th>Patient Name</th>
<th>Doctor Names</th>
<th>Diagnosis</th>
<th>Treatment</th>
<th>Date of Visit</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
         {histories.map((h) => {
           const patient = patients.find(p => p.userId === h.patientId);
           return (
<tr key={h.historyID}>
<td>{patient ? patient.name : 'Unknown Patient'}</td>
<td>{h.doctorNames}</td>
<td>{h.diagnosis}</td>
<td>{h.treatment}</td>
<td>{h.dateOfVisit?.split('T')[0]}</td>
<td>
<button onClick={() => populateEditForm(h)} className="btn btn-info btn-sm me-2">Edit</button>
<button onClick={() => handleDelete(h.historyID)} className="btn btn-danger btn-sm">Delete</button>
</td>
</tr>
           )
         })}
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