import React from 'react';
import './DepartmentsWithDoctors.css';

const departmentImages = {
  Cardiology: require('./images/cardiology1.jpg'),
  Neurology: require('./images/neurology1.jpg'),
  Orthopedics: require('./images/orthopedics.jpg'),
  Pediatrics: require('./images/pediatrics.jpg'),
  ENT: require('./images/ent images.webp'),
  Dermatology: require('./images/dermatology.jpg'),
  'General Medicine': require('./images/generalmedicine.jpg'),
  Emergency: require('./images/emergency.jpg'),
};

const DepartmentCard = ({ department, onClick }) => {
  const imageSrc = departmentImages[department] || require('./images/default.jpg');
  return (
    <div className="dept-card" onClick={() => onClick(department)}>
      <img src={imageSrc} alt={department} />
      <h4>{department}</h4>
    </div>
  );
};

export default DepartmentCard;
