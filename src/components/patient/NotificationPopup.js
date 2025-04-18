import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notificationpopup.css';
 
const NotificationPopup = () => {
  const [notification, setNotification] = useState('');
  const [showPopup, setShowPopup] = useState(false);
 
  const patientId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
 
  useEffect(() => {
    const fetchAndShowNotification = async () => {
      try {
        console.log("Triggering notification generation for patient:", patientId);
 
        // ✅ Step 1: Generate notifications (for upcoming appointments)
        await axios.post(
          `https://localhost:7166/api/Notification/generate-patient-upcoming/${patientId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
 
        // ✅ Step 2: Fetch notifications
        const response = await axios.get(
          `https://localhost:7166/api/Notification/getByPatient/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
 
        const notifications = response.data;
        console.log("Fetched notifications:", notifications);
 
        // ✅ Step 3: Parse & sort by nearest upcoming appointment date
        const futureNotifications = notifications.filter(n => {
          const match = n.message.match(/appointment on (\d{4}-\d{2}-\d{2})/);
          if (match && match[1]) {
            const appointmentDate = new Date(match[1]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return appointmentDate >= today;
          }
          return false;
        });
 
        futureNotifications.sort((a, b) => {
          const dateA = new Date(a.message.match(/appointment on (\d{4}-\d{2}-\d{2})/)[1]);
          const dateB = new Date(b.message.match(/appointment on (\d{4}-\d{2}-\d{2})/)[1]);
          return dateA - dateB;
        });
 
        // ✅ Step 4: Show the nearest notification
        if (futureNotifications.length > 0) {
          setNotification(futureNotifications[0].message);
          setShowPopup(true);
        }
 
      } catch (error) {
        console.error('Notification error:', error);
      }
    };
 
    if (patientId && token) {
      fetchAndShowNotification();
    }
  }, [patientId, token]);
 
  const closePopup = () => setShowPopup(false);
 
  return (
    showPopup && (
<div className="notification-popup">
<div className="popup-content">
<p>{notification}</p>
<button onClick={closePopup}>Close</button>
</div>
</div>
    )
  );
};
 
export default NotificationPopup;