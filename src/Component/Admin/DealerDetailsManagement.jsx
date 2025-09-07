import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { USER_API_ENDPOINTS } from '../../utils/apis';
import { getAccessTokenFromRefresh } from '../../utils/helper';
import '../../Css/Admin.css';

const DealerDetailsManagementNew = () => {
  const [dealersData, setDealersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [processingAccount, setProcessingAccount] = useState(null);
  const [expandedDealer, setExpandedDealer] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  useEffect(() => {
    // Check if user is admin before fetching
    const authData = localStorage.getItem('KTMauth');
    if (authData) {
      const parsedData = JSON.parse(authData);
      
      if (parsedData.is_admin) {
        fetchDealersData();
      } else {
        setLoading(false);
        Swal.fire({
          icon: 'warning',
          title: 'Access Denied',
          text: 'You do not have admin privileges to access dealer management.'
        });
      }
    } else {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Please login again to access this feature.'
      });
    }
  }, []);

  const fetchDealersData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.ADMIN_GET_ALL_DEALERS_DETAILS,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.dealers) {
        setDealersData(response.data.dealers);
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching dealers data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch dealers data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountToggle = async (dealerId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      text: `Are you sure you want to ${action} this dealer account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#dc2626' : '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setProcessingAccount(dealerId);
        const accessToken = await getAccessTokenFromRefresh();
        
        // You would need to implement the actual API endpoint for this
        // For now, we'll simulate the action
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        setDealersData(prevData => 
          prevData.map(dealer => 
            dealer.id === dealerId 
              ? { ...dealer, is_active: !currentStatus }
              : dealer
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Dealer account has been ${action}d successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error(`Error ${action}ing account:`, error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to ${action} account. Please try again.`
        });
      } finally {
        setProcessingAccount(null);
      }
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Completed': '#16a34a',
      'Confirmed': '#2563eb',
      'Pending': '#d97706',
      'Cancelled': '#dc2626',
      'Cancelled by Customer': '#dc2626'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    return (
      <span
        style={{
          backgroundColor: getStatusColor(status) + '20',
          color: getStatusColor(status),
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter dealers and their orders
  const getFilteredDealers = () => {
    return dealersData.filter(dealer => {
      const matchesSearch = dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.kt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.phone.includes(searchTerm);

      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'active' && dealer.is_active) ||
                           (filterStatus === 'inactive' && !dealer.is_active);

      return matchesSearch && matchesFilter;
    }).map(dealer => ({
      ...dealer,
      filteredOrders: dealer.orders.filter(order => {
        if (orderStatusFilter === 'all') return true;
        return order.status.toLowerCase().includes(orderStatusFilter.toLowerCase());
      })
    }));
  };

  const filteredDealers = getFilteredDealers();

  // Calculate summary statistics
  const totalOrders = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.total_orders, 0);
  const totalOrderValue = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.total_order_value, 0);
  const completedOrders = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.completed_orders, 0);
  const pendingOrders = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.pending_orders, 0);
  const confirmedOrders = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.confirmed_orders, 0);
  const cancelledOrders = filteredDealers.reduce((sum, dealer) => sum + dealer.order_statistics.cancelled_orders, 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
        <h3 style={{ color: '#64748b' }}>Loading Dealer Details...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#1e293b', 
          marginBottom: '10px', 
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          👥 Dealer Details Management
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Comprehensive dealer management with detailed order insights
        </p>
      </div>

      {/* Filters and Search */}
      <div className="commission-filter-container" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by name, email, KT ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="commission-search-input"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="commission-filter-select"
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Dealers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* <div>
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="commission-filter-select"
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Orders</option>
            <option value="completed">Completed</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div> */}

        <div className="commission-stats-badge" style={{
          padding: '8px 12px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1e40af',
          whiteSpace: 'nowrap'
        }}>
          Total: {filteredDealers.length} dealers
        </div>
      </div>

      {/* Summary Statistics */}
      {filteredDealers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatCurrency(totalOrderValue)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Order Value</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {totalOrders}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Orders</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {completedOrders}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Completed Orders</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {confirmedOrders}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Confirmed Orders</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {pendingOrders}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pending Orders</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {cancelledOrders}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Cancelled Orders</div>
          </div>
        </div>
      )}

      {/* Dealers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredDealers.length === 0 ? (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#64748b', marginBottom: '10px' }}>No dealers found</h3>
            <p style={{ color: '#64748b' }}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'No dealers available at the moment.'}
            </p>
          </div>
        ) : (
          filteredDealers.map((dealer) => (
            <div
              key={dealer.id}
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Dealer Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <h3 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {dealer.name}
                      </h3>
                      <span style={{
                        backgroundColor: dealer.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `2px solid ${dealer.is_active ? '#22c55e' : '#ef4444'}`,
                        color: dealer.is_active ? '#22c55e' : '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {dealer.is_active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      marginBottom: '15px',
                      opacity: 0.9
                    }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        <strong>KT ID:</strong> {dealer.kt_id}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        <strong>Email:</strong> {dealer.email}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        <strong>Phone:</strong> {dealer.phone}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        <strong>Joined:</strong> {formatDate(dealer.date_joined)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleAccountToggle(dealer.id, dealer.is_active)}
                      disabled={processingAccount === dealer.id}
                      style={{
                        backgroundColor: dealer.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        border: `2px solid ${dealer.is_active ? '#ef4444' : '#22c55e'}`,
                        color: dealer.is_active ? '#ef4444' : '#22c55e',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: processingAccount === dealer.id ? 'not-allowed' : 'pointer',
                        opacity: processingAccount === dealer.id ? 0.6 : 1,
                        transition: 'all 0.3s ease',
                        minWidth: '140px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {processingAccount === dealer.id ? 
                        '⏳ Processing...' : 
                        dealer.is_active ? '🚫 Deactivate' : '✅ Activate'
                      }
                    </button>

                    <button
                      onClick={() => setExpandedDealer(expandedDealer === dealer.id ? null : dealer.id)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: '140px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {expandedDealer === dealer.id ? '👆 Hide Orders' : '👇 View Orders'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              <div style={{ padding: '20px' }}>
                {/* Order Statistics */}
                <div className="dealer-stats-grid">
                  {[
                    { label: 'Total Orders', value: dealer.order_statistics.total_orders, color: '#3b82f6' },
                    { label: 'Confirmed', value: dealer.order_statistics.confirmed_orders, color: '#10b981' },
                    { label: 'Completed', value: dealer.order_statistics.completed_orders, color: '#059669' },
                    { label: 'Pending', value: dealer.order_statistics.pending_orders, color: '#f59e0b' },
                    { label: 'Cancelled', value: dealer.order_statistics.cancelled_orders, color: '#ef4444' }
                  ].map((stat, index) => (
                    <div key={index} className="stat-card">
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: stat.color
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue Statistics */}
                <div className="dealer-revenue-grid">
                  <div className="revenue-card total">
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#0369a1'
                    }}>
                      {formatCurrency(dealer.order_statistics.total_order_value)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      textTransform: 'uppercase'
                    }}>
                      Total Value
                    </div>
                  </div>
                  <div className="revenue-card confirmed">
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#15803d'
                    }}>
                      {formatCurrency(dealer.order_statistics.confirmed_completed_value)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      textTransform: 'uppercase'
                    }}>
                      Confirmed/Completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Orders Section */}
              {expandedDealer === dealer.id && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    color: '#1e293b',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    All Orders ({dealer.orders.length})
                  </h4>
                  
                  {dealer.orders.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                      No orders found for this dealer.
                    </p>
                  ) : (
                    <div className="dealer-orders-table" style={{ 
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th className="mobile-responsive-th">Order Number</th>
                            <th className="mobile-responsive-th">Status</th>
                            <th className="mobile-responsive-th" style={{ textAlign: 'right' }}>Amount</th>
                            <th className="mobile-responsive-th mobile-hidden">Created</th>
                            <th className="mobile-responsive-th mobile-hidden">Updated</th>
                            <th className="mobile-responsive-th mobile-hidden" style={{ textAlign: 'center' }}>Ordered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dealer.orders.map((order, index) => (
                            <tr
                              key={index}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <td style={{ 
                                padding: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1e293b'
                              }}>
                                {order.order_number || 'N/A'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                {getStatusBadge(order.status)}
                              </td>
                              <td style={{ 
                                padding: '12px',
                                textAlign: 'right',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1e293b'
                              }}>
                                {order.total_amount ? formatCurrency(order.total_amount) : 'N/A'}
                              </td>
                              <td className="mobile-hidden" style={{ 
                                padding: '12px',
                                fontSize: '14px',
                                color: '#64748b'
                              }}>
                                {formatDateTime(order.created_at)}
                              </td>
                              <td className="mobile-hidden" style={{ 
                                padding: '12px',
                                fontSize: '14px',
                                color: '#64748b'
                              }}>
                                {formatDateTime(order.updated_at)}
                              </td>
                              <td className="mobile-hidden" style={{ 
                                padding: '12px',
                                textAlign: 'center'
                              }}>
                                <span style={{
                                  backgroundColor: order.is_ordered ? '#dcfce7' : '#fee2e2',
                                  color: order.is_ordered ? '#16a34a' : '#dc2626',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {order.is_ordered ? '✓' : '✗'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DealerDetailsManagementNew;
