import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../../utils/adminAuth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminAccess = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if user is admin using utility function
  const userIsAdmin = isAdmin();

  // Only show admin access if user is admin
  if (!userIsAdmin) {
    return null;
  }

  const baseStyles = {
    backgroundColor: isHovered ? "white" : "#56b124",
    color: isHovered ? "#56b128" : "white",
    padding: "12px",
    borderRadius: "50%",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    border: "2px solid #267001ff",
    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    boxShadow: isHovered ? "0 4px 12px rgba(86, 177, 36, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
    width: "44px",
    height: "44px",
    userSelect: "none"
  };

  return (
    <Link 
      to="/admin/otp-verification"
      style={baseStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      title="Admin Panel"
    >
      <AdminPanelSettingsIcon style={{ fontSize: "20px" }} />
    </Link>
  );
};

export default AdminAccess;
