import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { USER_API_ENDPOINTS } from '../../utils/apis';
import { getAccessTokenFromRefresh } from '../../utils/helper';

const JoinUsBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: null,
    imagePreview: '',
    is_active: true,
    link_url: '',
    link_text: '',
    start_date: '',
    end_date: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchBanners();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 768;

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      const response = await axios.get(USER_API_ENDPOINTS.ADMIN_INTERNSHIP_BANNER_LIST, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load banners',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
    }
    setLoading(false);
  };

  const saveBannersToStorage = (bannersData) => {
    // No longer needed - we use API calls now
    // But keeping for potential future use
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target.result,
          imagePreview: event.target.result
        }));
        setImagePreview(event.target.result);
      };
      
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      image: null,
      imagePreview: '',
      is_active: true,
      link_url: '',
      link_text: '',
      start_date: '',
      end_date: ''
    });
    setImagePreview(null);
    setEditingBanner(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Banner title is required',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
      return;
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        Swal.fire({
          title: 'Error',
          text: 'End date cannot be before start date',
          icon: 'error',
          confirmButtonColor: '#56b124'
        });
        return;
      }
    }

    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('is_active', formData.is_active);
      submitData.append('link_url', formData.link_url.trim());
      submitData.append('link_text', formData.link_text.trim());
      submitData.append('start_date', formData.start_date);
      submitData.append('end_date', formData.end_date);
      
      if (formData.image && formData.image !== editingBanner?.image) {
        // Convert base64 to blob if it's a new image
        if (formData.image.startsWith('data:')) {
          const response = await fetch(formData.image);
          const blob = await response.blob();
          submitData.append('image', blob, 'banner-image.jpg');
        }
      }

      let response;
      if (editingBanner) {
        // Update existing banner
        response = await axios.put(
          `${USER_API_ENDPOINTS.ADMIN_INTERNSHIP_UPDATE_BANNER}${editingBanner.id}/`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire({
          title: 'Success!',
          text: 'Banner updated successfully',
          icon: 'success',
          confirmButtonColor: '#56b124'
        });
      } else {
        // Create new banner
        response = await axios.post(
          USER_API_ENDPOINTS.ADMIN_INTERNSHIP_CREATE_BANNER,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire({
          title: 'Success!',
          text: 'Banner created successfully',
          icon: 'success',
          confirmButtonColor: '#56b124'
        });
      }

      // Refresh banners list
      await fetchBanners();
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save banner',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      image: banner.image,
      imagePreview: banner.image,
      is_active: banner.is_active,
      link_url: banner.link_url || '',
      link_text: banner.link_text || '',
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    });
    setImagePreview(banner.image);
    setShowAddForm(true);
    
    // Scroll to the form section after a short delay to ensure form is rendered
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const toggleActiveStatus = async (banner) => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const submitData = new FormData();
      submitData.append('title', banner.title);
      submitData.append('description', banner.description);
      submitData.append('is_active', !banner.is_active);
      submitData.append('link_url', banner.link_url || '');
      submitData.append('link_text', banner.link_text || '');
      submitData.append('start_date', banner.start_date || '');
      submitData.append('end_date', banner.end_date || '');

      await axios.put(
        `${USER_API_ENDPOINTS.ADMIN_INTERNSHIP_UPDATE_BANNER}${banner.id}/`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      Swal.fire({
        title: 'Success!',
        text: `Banner ${!banner.is_active ? 'activated' : 'deactivated'} successfully`,
        icon: 'success',
        confirmButtonColor: '#56b124'
      });

      // Refresh banners list
      await fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update banner status',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
    }
  };

  const handleDelete = async (bannerId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const accessToken = await getAccessTokenFromRefresh();
        await axios.delete(
          `${USER_API_ENDPOINTS.ADMIN_INTERNSHIP_DELETE_BANNER}${bannerId}/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Banner has been deleted.',
          icon: 'success',
          confirmButtonColor: '#56b124'
        });

        // Refresh banners list
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete banner',
          icon: 'error',
          confirmButtonColor: '#56b124'
        });
      }
    }
  };

  const getBannerStatus = (banner) => {
    if (!banner.is_active) return { status: 'Inactive', color: '#6b7280', emoji: '❌' };
    
    const currentDate = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;
    
    if (startDate && currentDate < startDate) {
      return { status: 'Scheduled', color: '#f59e0b', emoji: '⏰' };
    }
    
    if (endDate && currentDate > endDate) {
      return { status: 'Expired', color: '#ef4444', emoji: '⏰' };
    }
    
    return { status: 'Active', color: '#10b981', emoji: '✅' };
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
        <p>Loading banners...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
        🎯 Internship Banner Management
      </h2>
      
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
            // Scroll to the form section after a short delay to ensure form is rendered
            setTimeout(() => {
              if (formRef.current) {
                formRef.current.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
              }
            }, 100);
          }}
          style={{
            backgroundColor: '#56b124',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3f8f1a'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#56b124'}
        >
          ➕ Add New Banner
        </button>
      </div>

      {showAddForm && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>
            {editingBanner ? '✏️ Edit Banner' : '➕ Add New Banner'}
          </h3>
          
          <form ref={formRef} onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Banner Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                placeholder="Enter banner title"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Enter banner description"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Banner Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Link URL
                </label>
                <input
                  type="text"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="https://example.com or paste full iframe code"
                />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  💡 You can paste a Google Form iframe code here, or just the URL. The system will extract the correct link.
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Link Text
                </label>
                <input
                  type="text"
                  name="link_text"
                  value={formData.link_text}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="Learn More"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 'bold' }}>Active Banner</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#56b124',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                {editingBanner ? '💾 Update Banner' : '➕ Create Banner'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>
          📋 Existing Banners ({banners.length})
        </h3>
        
        {banners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
            <p>No banners created yet. Click "Add New Banner" to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {banners.map((banner) => {
              const bannerStatus = getBannerStatus(banner);
              return (
                <div
                  key={banner.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: isTablet ? '15px' : '20px',
                    backgroundColor: banner.is_active ? '#f0f9ff' : '#f9fafb'
                  }}
                >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isTablet ? 'column' : 'row',
                  gap: '15px',
                  justifyContent: isTablet ? 'flex-start' : 'space-between',
                  alignItems: isTablet ? 'stretch' : 'flex-start'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '8px',
                      marginBottom: '10px',
                      alignItems: isMobile ? 'flex-start' : 'center'
                    }}>
                      <h4 style={{ 
                        margin: 0, 
                        color: '#1e293b', 
                        fontSize: isTablet ? '1.1rem' : '1.2rem',
                        wordBreak: 'break-word'
                      }}>
                        {banner.title}
                      </h4>
                      <span
                        style={{
                          alignSelf: 'flex-start',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: 'bold',
                          backgroundColor: bannerStatus.color,
                          color: 'white',
                          whiteSpace: 'nowrap',
                          marginLeft: isMobile ? '0' : '12px'
                        }}
                      >
                        {bannerStatus.emoji} {bannerStatus.status}
                      </span>
                    </div>
                    
                    {banner.description && (
                      <p style={{ 
                        margin: '8px 0', 
                        color: '#4b5563',
                        fontSize: isTablet ? '14px' : '16px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}>
                        {banner.description}
                      </p>
                    )}
                    
                    <div style={{ 
                      fontSize: isTablet ? '12px' : '14px', 
                      color: '#6b7280', 
                      marginTop: '10px'
                    }}>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Created:</strong> {formatDate(banner.created_at)}
                      </p>
                      {banner.updated_at !== banner.created_at && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>Updated:</strong> {formatDate(banner.updated_at)}
                        </p>
                      )}
                      {banner.link_url && (
                        <p style={{ 
                          margin: '2px 0',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word'
                        }}>
                          <strong>Link:</strong> {banner.link_url.length > (isMobile ? 20 : 30) ? banner.link_url.substring(0, (isMobile ? 20 : 30)) + '...' : banner.link_url}
                        </p>
                      )}
                      {banner.link_text && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>Button Text:</strong> {banner.link_text}
                        </p>
                      )}
                      {banner.start_date && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>Start Date:</strong> {new Date(banner.start_date).toLocaleDateString()}
                        </p>
                      )}
                      {banner.end_date && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>End Date:</strong> {new Date(banner.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {banner.image && (
                    <div style={{ 
                      marginTop: isTablet ? '15px' : '0',
                      marginLeft: isTablet ? '0' : '20px',
                      alignSelf: 'center'
                    }}>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        style={{
                          width: isTablet ? '100%' : '120px',
                          maxWidth: isTablet ? '200px' : '120px',
                          height: isTablet ? 'auto' : '80px',
                          minHeight: isTablet ? '60px' : '80px',
                          maxHeight: isTablet ? '120px' : '80px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  marginTop: '15px', 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  gap: isMobile ? '8px' : '10px'
                }}>
                  <button
                    onClick={() => handleEdit(banner)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: isMobile ? '10px 16px' : '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: isMobile ? '1' : 'none',
                      minWidth: '100px'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => toggleActiveStatus(banner)}
                    style={{
                      backgroundColor: banner.is_active ? '#f59e0b' : '#10b981',
                      color: 'white',
                      padding: isMobile ? '10px 16px' : '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: isMobile ? '1' : 'none',
                      minWidth: '120px'
                    }}
                  >
                    {banner.is_active ? '❌ Deactivate' : '✅ Activate'}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(banner.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: isMobile ? '10px 16px' : '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: isMobile ? '1' : 'none',
                      minWidth: '100px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinUsBannerManagement;
