import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";

// API endpoints
import { USER_API_ENDPOINTS, apiUrl } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";

// Styles
import "../../Css/Admin.css";

const WebsiteContent = () => {
  const [activeSection, setActiveSection] = useState('investor');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState({
    investor: [],
    mentor: [],
    intern: [],
    contact: [],
    suggestion: []
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Use KTMauth for admin authentication (consistent with AdminDashboard)
      const authData = localStorage.getItem('KTMauth');
      if (!authData) {
        throw new Error('No authentication data found');
      }
      
      const parsedAuth = JSON.parse(authData);
      let accessToken = parsedAuth?.access;
      
      if (!accessToken) {
        // Fallback to refresh token method if no access token
        accessToken = await getAccessTokenFromRefresh();
        if (!accessToken) {
          throw new Error('Unable to get access token');
        }
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      // Fetch all form data
      const [investorRes, mentorRes, internRes, contactRes, suggestionRes] = await Promise.all([
        axios.get(USER_API_ENDPOINTS.INVESTOR_FORM, { headers }),
        axios.get(USER_API_ENDPOINTS.MENTOR_FORM, { headers }),
        axios.get(USER_API_ENDPOINTS.INTERN_FORM, { headers }),
        axios.get(USER_API_ENDPOINTS.SEND_QUERY_VIA_CONTACT_FORM, { headers }),
        axios.get(USER_API_ENDPOINTS.SUGGESTION_FORM, { headers })
      ]);

      setData({
        investor: investorRes.data || [],
        mentor: mentorRes.data || [],
        intern: internRes.data || [],
        contact: contactRes.data || [],
        suggestion: suggestionRes.data || []
      });
    } catch (error) {
      console.error('Error fetching website content data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch website content data',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      new: { bg: '#e0f2fe', color: '#0369a1', icon: '🆕' },
      reviewed: { bg: '#f0fdf4', color: '#166534', icon: '✅' },
      pending: { bg: '#fef3c7', color: '#d97706', icon: '⏳' },
      resolved: { bg: '#f3e8ff', color: '#7c3aed', icon: '✨' }
    };

    const statusStyle = statusColors[status] || statusColors.new;
    
    return (
      <span className="wcm-status-badge" style={{
        backgroundColor: statusStyle.bg,
        color: statusStyle.color,
      }}>
        <span className="wcm-status-icon">{statusStyle.icon}</span>
        <span className="wcm-status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="wcm-modal-overlay">
        <div className="wcm-modal-content">
          <div className="wcm-modal-header">
            <h3 className="wcm-modal-title">
              <span className="wcm-modal-title-icon">📋</span>
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Details
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="wcm-modal-close"
            >
              ✕
            </button>
          </div>

          <div className="wcm-modal-body">
            <div className="wcm-modal-field">
              <strong>Name:</strong>
              <span>{selectedItem.name}</span>
            </div>
            
            <div className="wcm-modal-field">
              <strong>Email:</strong>
              <span>{selectedItem.email}</span>
            </div>
            
            {selectedItem.phone && (
              <div className="wcm-modal-field">
                <strong>Phone:</strong>
                <span>{selectedItem.phone}</span>
              </div>
            )}
            
            {selectedItem.domain && (
              <div className="wcm-modal-field">
                <strong>Domain:</strong>
                <span>{selectedItem.domain}</span>
              </div>
            )}
            
            {selectedItem.linkedin_id && (
              <div className="wcm-modal-field">
                <strong>LinkedIn:</strong>
                <a 
                  href={selectedItem.linkedin_id} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wcm-modal-link"
                >
                  View Profile 🔗
                </a>
              </div>
            )}
            
            {selectedItem.cv && (
              <div className="wcm-modal-field">
                <strong>CV:</strong>
                <a 
                  href={`http://127.0.0.1:8000${selectedItem.cv}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wcm-modal-link"
                >
                  Download CV 📄
                </a>
              </div>
            )}
            
            {selectedItem.subject && (
              <div className="wcm-modal-field">
                <strong>Subject:</strong>
                <span>{selectedItem.subject}</span>
              </div>
            )}
            
            {selectedItem.message && (
              <div className="wcm-modal-field">
                <strong>Message:</strong>
                <div className="wcm-modal-message">
                  {selectedItem.message}
                </div>
              </div>
            )}
            
            <div className="wcm-modal-field">
              <strong>Status:</strong>
              <span>
                {getStatusBadge(selectedItem.status)}
              </span>
            </div>
            
            <div className="wcm-modal-field">
              <strong>Submitted:</strong>
              <span>
                {formatDate(selectedItem.created_at || selectedItem.form_created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDataList = () => {
    const currentData = data[activeSection] || [];
    
    if (loading) {
      return (
        <div className="wcm-loading">
          <div className="wcm-loading-icon">⏳</div>
          <p className="wcm-loading-text">Loading {activeSection} data...</p>
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className="wcm-empty-state">
          <div className="wcm-empty-icon">📭</div>
          <h3 className="wcm-empty-title">No {activeSection} data found</h3>
          <p className="wcm-empty-text">No submissions have been received yet.</p>
        </div>
      );
    }

    return (
      <div className="wcm-data-grid">
        {currentData.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedItem(item)}
            className="wcm-data-card"
          >
            <div className="wcm-card-header">
              <h4 className="wcm-card-title">{item.name}</h4>
              {getStatusBadge(item.status)}
            </div>
            
            <div className="wcm-card-content">
              <p className="wcm-card-field">
                <strong>Email:</strong> {item.email}
              </p>
              
              {item.phone && (
                <p className="wcm-card-field">
                  <strong>Phone:</strong> {item.phone}
                </p>
              )}
              
              {item.domain && (
                <p className="wcm-card-field">
                  <strong>Domain:</strong> {item.domain}
                </p>
              )}
              
              {item.subject && (
                <p className="wcm-card-field">
                  <strong>Subject:</strong> {item.subject}
                </p>
              )}
            </div>
            
            <div className="wcm-card-footer">
              <span className="wcm-card-date">
                {formatDate(item.created_at || item.form_created_at)}
              </span>
              <span className="wcm-card-action">
                Click to view details →
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const exportToExcel = () => {
    let exportData = [];
    let fileName = "";
    let sheetName = "";

    if (activeSection === 'mentor') {
      exportData = data.mentor.map(({ name, email, phone, domain, linkedin_id, cv, status, created_at }) => ({
        Name: name,
        Email: email,
        Phone: phone,
        Domain: domain,
        LinkedIn: linkedin_id,
        CV: cv ? `${apiUrl}${cv}` : '',
        Status: status,
        "Created At": created_at
      }));
      fileName = "Mentor_Data.xlsx";
      sheetName = "Mentor Data";
    } else if (activeSection === 'intern') {
      exportData = data.intern.map(({ name, email, phone, domain, linkedin_id, cv, status, created_at }) => ({
        Name: name,
        Email: email,
        Phone: phone,
        Domain: domain,
        LinkedIn: linkedin_id,
        CV: cv ? `${apiUrl}${cv}` : '',
        Status: status,
        "Created At": created_at
      }));
      fileName = "Intern_Data.xlsx";
      sheetName = "Intern Data";
    }

    if (exportData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      XLSX.writeFile(workbook, fileName);
    }
  };

  const deleteAllData = async () => {
    try {
      const authData = localStorage.getItem('KTMauth');
      if (!authData) {
        throw new Error('No authentication data found');
      }

      const parsedAuth = JSON.parse(authData);
      let accessToken = parsedAuth?.access;

      if (!accessToken) {
        accessToken = await getAccessTokenFromRefresh();
        if (!accessToken) {
          throw new Error('Unable to get access token');
        }
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const endpoint = USER_API_ENDPOINTS[`${activeSection === 'contact' ? 'SEND_QUERY_VIA_CONTACT_FORM' : activeSection.toUpperCase() + '_FORM'}`];

      if (!endpoint) {
        throw new Error('Invalid form section selected');
      }

      const response = await axios.post(endpoint, { delete_all: true }, { headers });

      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });

      // Refresh data after deletion
      fetchAllData();
    } catch (error) {
      console.error('Error deleting all data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete all data',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const sectionTabs = [
    { id: 'investor', label: 'Investor Forms', icon: '💰', count: data.investor?.length || 0 },
    { id: 'mentor', label: 'Mentor Forms', icon: '👨‍🏫', count: data.mentor?.length || 0 },
    { id: 'intern', label: 'Intern Forms', icon: '🎓', count: data.intern?.length || 0 },
    { id: 'contact', label: 'Contact Queries', icon: '📞', count: data.contact?.length || 0 },
    { id: 'suggestion', label: 'Suggestions', icon: '💡', count: data.suggestion?.length || 0 }
  ];

  return (
    <div className="website-content-admin">
      {/* Header */}
      <div className="wcm-header">
        <h2 className="wcm-title">
          <span className="wcm-title-icon">🌐</span>
          <span className="wcm-title-text">Website Content Management</span>
        </h2>
        <p className="wcm-subtitle">
          View and manage all form submissions from your website visitors
        </p>
      </div>

      {/* Section Tabs */}
      <div className="wcm-tabs-container">
        {sectionTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`wcm-tab ${activeSection === tab.id ? 'active' : ''}`}
          >
            <span className="wcm-tab-icon">{tab.icon}</span>
            <span className="wcm-tab-label">{tab.label}</span>
            <span className={`wcm-tab-count ${activeSection === tab.id ? 'active' : ''}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="wcm-actions">
        <button
          onClick={fetchAllData}
          disabled={loading}
          className={`wcm-btn wcm-btn-refresh ${loading ? 'loading' : ''}`}
        >
          <span className="wcm-btn-icon">{loading ? '⏳' : '🔄'}</span>
          <span className="wcm-btn-text">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>

        <button
          onClick={() => {
            Swal.fire({
              title: 'Are you sure?',
              text: `This will delete all ${activeSection} data. This action cannot be undone!`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3b82f6',
              confirmButtonText: 'Delete All'
            }).then((result) => {
              if (result.isConfirmed) {
                deleteAllData();
              }
            });
          }}
          className="wcm-btn wcm-btn-delete"
        >
          <span className="wcm-btn-icon">🗑️</span>
          <span className="wcm-btn-text">Delete All</span>
        </button>

        {(activeSection === 'mentor' || activeSection === 'intern') && (
          <button
            onClick={exportToExcel}
            className="wcm-btn wcm-btn-export"
          >
            <span className="wcm-btn-icon">📤</span>
            <span className="wcm-btn-text">Export {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Data</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="wcm-content-area">
        {renderDataList()}
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default WebsiteContent;
