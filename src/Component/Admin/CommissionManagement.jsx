import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { USER_API_ENDPOINTS, apiUrl1 } from '../../utils/apis';
import { getAccessTokenFromRefresh } from '../../utils/helper';
import '../../Css/Admin.css';

const CommissionManagement = () => {
  const [commissionData, setCommissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [processingAccount, setProcessingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Check if user is admin before fetching
    const authData = localStorage.getItem('KTMauth');
    if (authData) {
      const parsedData = JSON.parse(authData);
      console.log('User auth data:', parsedData);
      
      if (parsedData.is_admin) {
        fetchCommissionBills();
      } else {
        setLoading(false);
        Swal.fire({
          icon: 'warning',
          title: 'Access Denied',
          text: 'You do not have admin privileges to access commission management.'
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

  const fetchCommissionBills = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessTokenFromRefresh();
      
      // Build the URL manually as a fallback
      const apiEndpoint = USER_API_ENDPOINTS.ADMIN_GET_ALL_COMMISSION_BILLS || `${apiUrl1}/invoice/get-all-payment-details/`;
      
      console.log('API Endpoint:', apiEndpoint);
      console.log('Access Token:', accessToken ? 'Token received' : 'No token');
      console.log('apiUrl1:', apiUrl1);
      
      const response = await axios({
        method: 'GET',
        url: apiEndpoint,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Commission data response:', response.data);
      setCommissionData(response.data.payment_transactions || []);
    } catch (error) {
      console.error('Error fetching commission bills:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      let errorMessage = 'Failed to fetch commission payment details.';
      
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. You may not have admin privileges.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCommissionPayment = async (transactionId) => {
    try {
      setVerifyingPayment(transactionId);
      const accessToken = await getAccessTokenFromRefresh();
      
      const requestBody = {
        action: "approve",
        notes: "" // Use empty string if no notes provided
      };
      
      // Build URL manually as fallback
      const verifyEndpoint = USER_API_ENDPOINTS.ADMIN_VERIFY_COMMISSION_PAYMENT || `${apiUrl1}/invoice/verify-commission-payment/`;
      const fullUrl = `${verifyEndpoint}${transactionId}/`;
      
      console.log('Verify URL:', fullUrl);
      console.log('Request body:', requestBody);
      
      const response = await axios({
        method: 'POST',
        url: fullUrl,
        data: requestBody,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Payment Approved',
        text: response.data.message || 'Commission payment has been approved successfully',
        timer: 3000,
        showConfirmButton: false
      });

      // Refresh the data
      fetchCommissionBills();
    } catch (error) {
      console.error('Error verifying payment:', error);
      console.error('Verification error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to verify commission payment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You may not have admin privileges.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Transaction not found.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: errorMessage
      });
    } finally {
      setVerifyingPayment(null);
    }
  };

  const toggleAccountActivation = async (userId, currentStatus, dealerName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmResult = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account?`,
      text: `Are you sure you want to ${action} ${dealerName}'s account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });

    if (confirmResult.isConfirmed) {
      setProcessingAccount(userId);
      try {
        const accessToken = await getAccessTokenFromRefresh();
        
        const response = await axios.get(
          `${USER_API_ENDPOINTS.ADMIN_ACCOUNT_ACTIVATION}${userId}&action=${action}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire({
          title: 'Success!',
          text: response.data.message,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });

        // Refresh commission data
        fetchCommissionBills();
      } catch (error) {
        console.error('Error updating account status:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || `Failed to ${action} account`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setProcessingAccount(null);
      }
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

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#10b981';
      case 'unpaid':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const filteredData = commissionData.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.dealer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.dealer?.kt_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' || 
      (transaction.commission_status?.toLowerCase() === filterStatus.toLowerCase());

    return matchesSearch && matchesFilter;
  }).reverse(); // Reverse the order to show most recent first

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
        <h3 style={{ color: '#64748b' }}>Loading Commission Data...</h3>
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
          💰 Commission Management
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Manage and verify commission payments for dealers
        </p>
      </div>

      {/* Filters and Search */}
      <div className="commission-filter-container">
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by Transaction ID, Dealer Name, or KT ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="commission-search-input"
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="commission-filter-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending_verification">Pending Verification</option>
          </select>
        </div>

        <div className="commission-stats-badge">
          Total: {filteredData.length} transactions
        </div>
      </div>

      {/* Summary Statistics */}
      {filteredData.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(3, 1fr)'
          }
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
              {formatCurrency(filteredData.reduce((sum, t) => sum + parseFloat(t.amount), 0))}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Commission Amount</div>
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
              {filteredData.length}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Dealers</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {filteredData.reduce((sum, t) => {
                return sum + (t.commission_periods?.reduce((periodSum, p) => periodSum + (p.orders?.length || 0), 0) || 0);
              }, 0)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Commission Orders</div>
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
              {filteredData.reduce((sum, t) => sum + (t.non_commission_orders?.length || 0), 0)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Non-Commission Orders</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {filteredData.filter(t => t.verified).length}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Verified Payments</div>
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
              {filteredData.filter(t => !t.verified).length}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pending Verification</div>
          </div>
        </div>
      )}

      {/* Commission Payment Cards */}
      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {filteredData.length === 0 ? (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
            <h3 style={{ color: '#64748b', marginBottom: '10px' }}>No Commission Payments Found</h3>
            <p style={{ color: '#64748b' }}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No commission payment transactions available at the moment'
              }
            </p>
          </div>
        ) : (
          filteredData.map((transaction) => (
            <div key={transaction.id} className="commission-card">
              {/* Header Section */}
              <div className="commission-header">
                <div>
                  <h3 className="commission-transaction-id">
                    Transaction #{transaction.transaction_id}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: getStatusColor(transaction.commission_status) + '20',
                    color: getStatusColor(transaction.commission_status),
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {transaction.commission_status}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="commission-amount">
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="commission-amount-label">
                    Commission Amount
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="commission-info-section commission-dealer-info">
                <h4 className="commission-section-title">
                  🏪 Dealer Information
                </h4>
                <div className="commission-info-grid">
                  <div>
                    <strong>Name:</strong> {transaction.dealer.name}
                  </div>
                  <div>
                    <strong>KT ID:</strong> {transaction.dealer.kt_id}
                  </div>
                  <div>
                    <strong>Email:</strong> {transaction.dealer.email}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{
                      color: transaction.dealer.is_active ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {transaction.dealer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="commission-info-section commission-payment-info">
                <h4 className="commission-section-title">
                  💳 Payment Details
                </h4>
                <div className="commission-info-grid">
                  <div>
                    <strong>Payment Method:</strong> {transaction.payment_method}
                  </div>
                  <div>
                    <strong>Verified:</strong> 
                    <span style={{
                      color: transaction.verified ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {transaction.verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {transaction.notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Notes:</strong> {transaction.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Commission Periods Details */}
              <div className="commission-info-section commission-orders-info">
                <h4 className="commission-section-title">
                  📦 Commission Periods ({transaction.commission_periods?.length || 0})
                </h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {transaction.commission_periods?.map((period, periodIndex) => (
                    <div key={periodIndex} style={{
                      background: '#f8fafc',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '10px',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <strong>Commission ID:</strong> {period.commission_id}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <span style={{
                            color: period.commission_status === 'Paid' ? '#10b981' : '#f59e0b',
                            fontWeight: '600',
                            marginLeft: '5px'
                          }}>
                            {period.commission_status}
                          </span>
                        </div>
                        <div>
                          <strong>Commission:</strong> {formatCurrency(period.commission_amount)}
                        </div>
                        <div>
                          <strong>Total Orders:</strong> {formatCurrency(period.total_order_amount)}
                        </div>
                        <div>
                          <strong>Calculation Date:</strong> {formatDate(period.calculation_date)}
                        </div>
                        <div>
                          <strong>Due Date:</strong> {formatDate(period.payment_due_date)}
                        </div>
                      </div>
                      
                      {/* Orders in this commission period */}
                      <div>
                        <h5 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px' }}>
                          Orders ({period.orders?.length || 0})
                        </h5>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {period.orders?.map((order, orderIndex) => (
                            <div key={orderIndex} className="commission-order-card" style={{
                              background: 'white',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb',
                              fontSize: '13px'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                <div>
                                  <strong>Order:</strong> {order.order_number}
                                </div>
                                <div>
                                  <strong>Status:</strong> 
                                  <span style={{
                                    color: order.status === 'Confirmed' ? '#10b981' : 
                                           order.status === 'Completed' ? '#38c8cdff' : 
                                           order.status === 'Pending' ? '#FFC107' : 
                                           order.status === 'Cancelled' ? '#F44336' : 
                                           order.status === 'Cancelled by Customer' ? '#FF5722' : '#9E9E9E',
                                    fontWeight: '600',
                                    marginLeft: '5px'
                                  }}>
                                    {order.status}
                                  </span>
                                </div>
                                <div>
                                  <strong>Amount:</strong> {formatCurrency(order.total_amount)}
                                </div>
                                <div>
                                  <strong>Date:</strong> {formatDate(order.created_at)}
                                </div>
                                <div>
                                  <strong>In Commission:</strong>
                                  <span style={{
                                    color: order.included_in_commission ? '#10b981' : '#ef4444',
                                    fontWeight: '600',
                                    marginLeft: '5px'
                                  }}>
                                    {order.included_in_commission ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Commission Orders (if any) */}
              {transaction.non_commission_orders && transaction.non_commission_orders.length > 0 && (
                <div className="commission-info-section commission-orders-info">
                  <h4 className="commission-section-title">
                    🚫 Non-Commission Orders ({transaction.non_commission_orders.length})
                  </h4>
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {transaction.non_commission_orders.map((order, index) => (
                      <div key={index} className="commission-order-card" style={{
                        background: '#fef2f2',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                          <div>
                            <strong>Order:</strong> {order.order_number}
                          </div>
                          <div>
                            <strong>Status:</strong> 
                            <span style={{
                              color: order.status === 'Confirmed' ? '#10b981' : 
                                     order.status === 'Completed' ? '#4CAF50' : 
                                     order.status === 'Pending' ? '#FFC107' : 
                                     order.status === 'Cancelled' ? '#F44336' : 
                                     order.status === 'Cancelled by Customer' ? '#FF5722' : '#9E9E9E',
                              fontWeight: '600',
                              marginLeft: '5px'
                            }}>
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <strong>Amount:</strong> {order.total_amount ? formatCurrency(order.total_amount) : 'N/A'}
                          </div>
                          <div>
                            <strong>Date:</strong> {formatDate(order.created_at)}
                          </div>
                          <div>
                            <strong>In Commission:</strong>
                            <span style={{
                              color: '#ef4444',
                              fontWeight: '600',
                              marginLeft: '5px'
                            }}>
                              No
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="commission-actions">
                {transaction.payment_screenshot && (
                  <a
                    href={`${apiUrl1}${transaction.payment_screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="commission-action-btn commission-view-btn"
                  >
                    🖼️ View Screenshot
                  </a>
                )}
                
                {!transaction.verified && (
                  <button
                    onClick={() => verifyCommissionPayment(transaction.id)}
                    disabled={verifyingPayment === transaction.id}
                    className="commission-action-btn commission-verify-btn"
                  >
                    {verifyingPayment === transaction.id ? '⏳ Processing...' : '⚡ Process Payment'}
                  </button>
                )}

                {transaction.verified && (
                  <div className="commission-verified-badge">
                    ✅ Payment Verified
                  </div>
                )}

                <button
                  onClick={() => toggleAccountActivation(
                    transaction.dealer.auth_id, 
                    transaction.dealer.is_active,
                    transaction.dealer.name
                  )}
                  disabled={processingAccount === transaction.dealer.auth_id}
                  className={`commission-action-btn ${transaction.dealer.is_active ? 'commission-deactivate-btn' : 'commission-activate-btn'}`}
                  style={{
                    background: processingAccount === transaction.dealer.auth_id
                      ? '#94a3b8'
                      : transaction.dealer.is_active
                        ? '#ef4444' 
                        : '#10b981',
                    opacity: processingAccount === transaction.dealer.auth_id ? 0.7 : 1,
                    cursor: processingAccount === transaction.dealer.auth_id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processingAccount === transaction.dealer.auth_id
                    ? '⏳ Processing...'
                    : transaction.dealer.is_active
                      ? '🔒 Deactivate Account'
                      : '🔓 Activate Account'
                  }
                </button>
              </div>
            </div>           
          ))
        )}
      </div>
    </div>
  );
};

export default CommissionManagement;
