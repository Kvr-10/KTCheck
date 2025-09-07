import '../../Css/AdminBannerManagement.css';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";
import "../../Css/Admin.css";

const AdminNewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'News',
    image: null,
    start_date: '',
    end_date: '',
    is_active: false,
    link_url: '',
    link_text: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.HOMEPAGE_ADMIN_GET_ALL_NEWS,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch news'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'file') {
      const file = e.target.files[0];
      // Revoke previous blob URL if any
      if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
      } else {
        setImagePreview(null);
      }
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'News',
      image: null,
      start_date: '',
      end_date: '',
      is_active: false,
      link_url: '',
      link_text: ''
    });
    setEditingNews(null);
    setShowAddForm(false);
    // cleanup preview blob URL
    if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const accessToken = await getAccessTokenFromRefresh();
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'is_active') {
          formDataToSend.append(key, formData[key].toString());
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (editingNews) {
        // Update existing news
        response = await axios.put(
          `${USER_API_ENDPOINTS.HOMEPAGE_ADMIN_UPDATE_NEWS}${editingNews.id}/`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new news
        response = await axios.post(
          USER_API_ENDPOINTS.HOMEPAGE_ADMIN_CREATE_NEWS,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingNews ? 'News updated successfully!' : 'News created successfully!'
      });

      fetchNews();
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.detail || 'Failed to save news'
      });
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title || '',
      description: newsItem.description || '',
      category: newsItem.category || 'News',
      image: null, // Don't prefill image
      start_date: newsItem.start_date || '',
      end_date: newsItem.end_date || '',
      is_active: newsItem.is_active || false,
      link_url: newsItem.link_url || '',
      link_text: newsItem.link_text || ''
    });
    // Show existing news image as preview when editing
    setImagePreview(newsItem.image || null);
    setShowAddForm(true);
    // Wait for the form to render then scroll it into view
    setTimeout(() => {
      try {
        if (formRef && formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // move keyboard focus for accessibility
          if (typeof formRef.current.focus === 'function') {
            formRef.current.focus({ preventScroll: true });
          }
        }
      } catch (err) {
        // no-op on scroll errors
        // console.debug('scroll to edit form failed', err);
      }
    }, 80);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActiveStatus = async (newsItem) => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      const formDataToSend = new FormData();
      formDataToSend.append('is_active', (!newsItem.is_active).toString());

      await axios.put(
        `${USER_API_ENDPOINTS.HOMEPAGE_ADMIN_UPDATE_NEWS}${newsItem.id}/`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `News ${newsItem.is_active ? 'deactivated' : 'activated'} successfully!`
      });

      fetchNews();
    } catch (error) {
      console.error('Error toggling news status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update news status'
      });
    }
  };

  const handleDelete = async (newsId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
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
          `${USER_API_ENDPOINTS.HOMEPAGE_ADMIN_DELETE_NEWS}${newsId}/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'News has been deleted successfully.'
        });

        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete news'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'News':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'Blogs':
        return { bg: '#f3e8ff', color: '#7c3aed', border: '#e9d5ff' };
      case 'Updates':
        return { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  if (loading) {
    return (
      <div className="banner-loading">
        <div className="banner-loading-icon">⏳</div>
        <p>Loading news...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: window.innerWidth > 768 ? '24px' : '16px',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div className="banner-header-card" style={{ 
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        borderRadius: '16px',
        padding: window.innerWidth > 768 ? '24px' : '20px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: window.innerWidth > 768 ? 'center' : 'flex-start',
          flexDirection: window.innerWidth > 768 ? 'row' : 'column',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: window.innerWidth > 768 ? '2.5rem' : window.innerWidth > 480 ? '2rem' : '1.75rem',
              margin: '0 0 8px 0',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              📰 News Management
            </h1>
            <p style={{ 
              margin: 0, 
              opacity: 0.9,
              fontSize: window.innerWidth > 768 ? '1.1rem' : '1rem'
            }}>
              Create and manage news articles for your website
            </p>
          </div>
          <button
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }}
            style={{
              background: showAddForm 
                ? 'rgba(255, 255, 255, 0.25)' 
                : 'rgba(255, 255, 255, 0.95)',
              color: showAddForm ? '#ffffff' : '#7c3aed',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: window.innerWidth > 768 ? '14px' : '13px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              minWidth: window.innerWidth > 768 ? '160px' : '140px',
              textShadow: showAddForm ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
              width: window.innerWidth > 768 ? 'auto' : '100%'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
              if (showAddForm) {
                e.target.style.background = 'rgba(255, 255, 255, 0.35)';
              } else {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = showAddForm 
                ? 'rgba(255, 255, 255, 0.25)' 
                : 'rgba(255, 255, 255, 0.95)';
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Article'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div ref={formRef} tabIndex={-1} style={{
          background: 'white',
          borderRadius: '16px',
          padding: window.innerWidth > 768 ? '32px' : '20px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1e293b',
              fontSize: window.innerWidth > 768 ? '1.5rem' : '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {editingNews ? '✏️ Edit News Article' : '➕ Create New Article'}
            </h2>
            <p style={{
              margin: '8px 0 0 0',
              color: '#64748b',
              fontSize: window.innerWidth > 768 ? '14px' : '13px'
            }}>
              {editingNews 
                ? 'Update the news article details below' 
                : 'Fill in the details to create a new news article'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 1024 
                ? 'repeat(2, 1fr)' 
                : '1fr',
              gap: window.innerWidth > 768 ? '24px' : '16px',
              marginBottom: '32px'
            }}>
              <div style={{ 
                gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1' 
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a compelling title for your news article"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ 
                gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1' 
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={window.innerWidth > 768 ? "4" : "3"}
                  placeholder="Provide a detailed description of the news article"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="News">News</option>
                  <option value="Blogs">Blogs</option>
                  <option value="Updates">Updates</option>
                </select>
              </div>

              <div style={{ 
                gridColumn: window.innerWidth > 1024 ? 'span 1' : 'span 1' 
              }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Article Image {!editingNews && '*'}
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: window.innerWidth > 768 ? '20px' : '16px',
                  textAlign: 'center',
                  background: '#fafbfc',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  minHeight: window.innerWidth > 768 ? 'auto' : '120px'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#fafbfc';
                }}
                >
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!editingNews}
                    style={{ display: 'none' }}
                    id="news-image-upload"
                  />
                  <label htmlFor="news-image-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    {imagePreview ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: window.innerWidth > 768 ? '200px' : '120px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ 
                          fontSize: window.innerWidth > 768 ? '2rem' : '1.5rem', 
                          marginBottom: '8px' 
                        }}>📸</div>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          fontWeight: '600', 
                          color: '#374151',
                          fontSize: window.innerWidth > 768 ? '14px' : '13px'
                        }}>
                          Click to upload image
                        </p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: window.innerWidth > 768 ? '12px' : '11px', 
                          color: '#64748b' 
                        }}>
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Link URL
                </label>
                <input
                  type="url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Link Text
                </label>
                <input
                  type="text"
                  name="link_text"
                  value={formData.link_text}
                  onChange={handleInputChange}
                  placeholder="Read More"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: '#fafbfc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1'
              }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{ 
                    transform: 'scale(1.3)',
                    accentColor: '#3b82f6'
                  }}
                />
                <label style={{ 
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer'
                }}>
                  Make this article active immediately
                </label>
              </div>
            </div>

            <div className="admin-banner-btns" style={{
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  minWidth: '140px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                }}
              >
                {editingNews ? '✏️ Update Article' : '✅ Create Article'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  minWidth: '100px',
                  opacity: 1,
                  visibility: 'visible'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e2e8f0';
                  e.target.style.color = '#475569';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.color = '#64748b';
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: 0,
            color: '#1e293b',
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 All News Articles ({news.length})
          </h3>
        </div>
        
        {news.length === 0 ? (
          <div style={{
            padding: '60px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '16px',
              opacity: 0.5 
            }}>📰</div>
            <h3 style={{ 
              color: '#64748b', 
              marginBottom: '8px',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              No News Articles Found
            </h3>
            <p style={{ 
              color: '#9ca3af',
              margin: 0,
              fontSize: '14px'
            }}>
              Create your first news article to get started!
            </p>
          </div>
        ) : (
          <div style={{ padding: window.innerWidth > 768 ? '24px' : '16px' }}>
            <div style={{ 
              display: 'grid',
              gap: window.innerWidth > 768 ? '20px' : '16px'
            }}>
              {news.map((newsItem, index) => (
                <div 
                  key={newsItem.id}
                  style={{
                    background: '#fafbfc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: window.innerWidth > 768 ? '20px' : '16px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ 
                    display: window.innerWidth > 768 ? 'grid' : 'flex',
                    gridTemplateColumns: window.innerWidth > 768 ? 'auto 1fr auto' : 'none',
                    flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                    gap: window.innerWidth > 768 ? '20px' : '16px',
                    alignItems: window.innerWidth > 768 ? 'start' : 'stretch'
                  }}>
                    {/* News Image */}
                    <div style={{ 
                      display: 'flex',
                      justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
                      order: window.innerWidth > 768 ? '0' : '1'
                    }}>
                      {newsItem.image && (
                        <img
                          src={newsItem.image}
                          alt={newsItem.title}
                          style={{
                            width: window.innerWidth > 768 ? '120px' : '100%',
                            maxWidth: window.innerWidth > 768 ? '120px' : '100%',
                            height: window.innerWidth > 768 ? '80px' : 'auto',
                            maxHeight: window.innerWidth > 768 ? '80px' : '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      )}
                    </div>
                    
                    {/* News Details */}
                    <div style={{ 
                      minWidth: 0,
                      order: window.innerWidth > 768 ? '0' : '0',
                      flex: '1'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        marginBottom: '12px',
                        flexDirection: window.innerWidth > 480 ? 'row' : 'column',
                        alignItems: window.innerWidth > 480 ? 'center' : 'flex-start'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: '#1e293b',
                          fontSize: window.innerWidth > 768 ? '1.25rem' : window.innerWidth > 480 ? '1.1rem' : '1rem',
                          fontWeight: '600',
                          flex: window.innerWidth > 480 ? '1' : 'none'
                        }}>
                          {newsItem.title}
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: getCategoryColor(newsItem.category).bg,
                            color: getCategoryColor(newsItem.category).color,
                            border: `1px solid ${getCategoryColor(newsItem.category).border}`,
                          }}>
                            {newsItem.category}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: newsItem.is_active 
                              ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            color: newsItem.is_active ? '#15803d' : '#92400e',
                            border: newsItem.is_active 
                              ? '1px solid #bbf7d0' 
                              : '1px solid #fde68a',
                            alignSelf: window.innerWidth > 480 ? 'center' : 'flex-start'
                          }}>
                            {newsItem.is_active ? '✅ Active' : '⚠️ Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{ 
                        margin: '0 0 16px 0', 
                        color: '#64748b',
                        fontSize: window.innerWidth > 768 ? '14px' : '13px',
                        lineHeight: '1.5'
                      }}>
                        {newsItem.description}
                      </p>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 
                          ? 'repeat(auto-fit, minmax(200px, 1fr))' 
                          : '1fr',
                        gap: window.innerWidth > 768 ? '16px' : '12px',
                        fontSize: window.innerWidth > 768 ? '13px' : '12px',
                        color: '#64748b'
                      }}>
                        <div>
                          <strong style={{ color: '#374151' }}>Duration:</strong>
                          <br />
                          {formatDate(newsItem.start_date)} → {formatDate(newsItem.end_date)}
                        </div>
                        
                        {newsItem.link_url && (
                          <div>
                            <strong style={{ color: '#374151' }}>Link:</strong>
                            <br />
                            <a 
                              href={newsItem.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#3b82f6', 
                                textDecoration: 'none',
                                fontSize: window.innerWidth > 768 ? '13px' : '12px',
                                wordBreak: 'break-all'
                              }}
                            >
                              {newsItem.link_text || 'Visit Link'} ↗
                            </a>
                          </div>
                        )}
                        
                        <div>
                          <strong style={{ color: '#374151' }}>Created:</strong>
                          <br />
                          {formatDate(newsItem.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div style={{ 
                      display: 'flex',
                      flexDirection: window.innerWidth > 768 ? 'column' : 'row',
                      gap: window.innerWidth > 768 ? '8px' : '12px',
                      minWidth: window.innerWidth > 768 ? '120px' : 'auto',
                      justifyContent: window.innerWidth > 768 ? 'flex-start' : 'space-between',
                      flexWrap: window.innerWidth > 768 ? 'nowrap' : 'wrap',
                      order: window.innerWidth > 768 ? '0' : '2',
                      width: window.innerWidth > 768 ? 'auto' : '100%'
                    }}>
                      <button
                        onClick={() => toggleActiveStatus(newsItem)}
                        style={{
                          background: newsItem.is_active 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: window.innerWidth > 768 ? '8px 16px' : '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: window.innerWidth > 768 ? '12px' : '13px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          width: window.innerWidth > 768 ? '100%' : 'auto',
                          minWidth: window.innerWidth > 768 ? '100px' : '110px',
                          flex: window.innerWidth > 768 ? 'none' : '1'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {newsItem.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(newsItem)}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          padding: window.innerWidth > 768 ? '8px 16px' : '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: window.innerWidth > 768 ? '12px' : '13px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          width: window.innerWidth > 768 ? '100%' : 'auto',
                          minWidth: window.innerWidth > 768 ? '80px' : '90px',
                          flex: window.innerWidth > 768 ? 'none' : '1'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ✏️ Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(newsItem.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          padding: window.innerWidth > 768 ? '8px 16px' : '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: window.innerWidth > 768 ? '12px' : '13px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          width: window.innerWidth > 768 ? '100%' : 'auto',
                          minWidth: window.innerWidth > 768 ? '80px' : '90px',
                          flex: window.innerWidth > 768 ? 'none' : '1'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsManagement;
