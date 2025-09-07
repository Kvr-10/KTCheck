import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';

// Components
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";

// Styles
import "../../Css/Admin.css";

// API endpoints
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";

const AdminDealerManagement = () => {
  const [dealerData, setDealerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, inactive, with_subscription, with_marketplace
  const [processingDealer, setProcessingDealer] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [addingDealer, setAddingDealer] = useState(false);
  const [deactivatingMarketplace, setDeactivatingMarketplace] = useState(null);

  useEffect(() => {
    fetchDealerDetails();
  }, []);

  const fetchDealerDetails = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.ADMIN_VIEW_DEALER_DETAILS,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setDealerData(response.data);
    } catch (error) {
      console.error('Error fetching dealer details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch dealer details',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDealerStatus = async (dealerId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmResult = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Dealer?`,
      text: `Are you sure you want to ${action} this dealer account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });

    if (confirmResult.isConfirmed) {
      setProcessingDealer(dealerId);
      try {
        const accessToken = await getAccessTokenFromRefresh();
        
        const response = await axios.post(
          USER_API_ENDPOINTS.ADMIN_UPDATE_DEALER_STATUS,
          { 
            dealer_id: dealerId,
            status: !currentStatus
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire({
          title: 'Success!',
          text: `Dealer has been ${action}d successfully`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });

        // Refresh dealer data
        fetchDealerDetails();
      } catch (error) {
        console.error('Error updating dealer status:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.error || `Failed to ${action} dealer`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setProcessingDealer(null);
      }
    }
  };

  const toggleAccountActivation = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmResult = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account?`,
      text: `Are you sure you want to ${action} this user account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });

    if (confirmResult.isConfirmed) {
      setProcessingDealer(userId);
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

        // Refresh dealer data
        fetchDealerDetails();
      } catch (error) {
        console.error('Error updating account status:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || `Failed to ${action} account`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setProcessingDealer(null);
      }
    }
  };

  const verifyPayment = async (transactionId, dealerName, transactionRef) => {
    const { value: notes } = await Swal.fire({
      title: 'Verify Payment',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p><strong>Dealer:</strong> ${dealerName}</p>
          <p><strong>Transaction Reference:</strong> ${transactionRef}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Add verification notes (optional)',
      inputPlaceholder: 'e.g., Payment received via QR code, amount verified...',
      showCancelButton: true,
      confirmButtonText: '✅ Approve Payment',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      inputValidator: () => {
        // Notes are optional, so no validation needed
        return null;
      }
    });

    if (notes !== undefined) { // User clicked approve (notes can be empty string)
      setVerifyingPayment(transactionId);
      try {
        const accessToken = await getAccessTokenFromRefresh();
        
        const response = await axios.post(
          `${USER_API_ENDPOINTS.ADMIN_VERIFY_PAYMENT}${transactionId}/`,
          {
            action: "approve",
            notes: notes || "Payment verified by admin"
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire({
          title: 'Payment Verified!',
          html: `
            <div style="text-align: left;">
              <p style="color: #10b981; font-weight: 600; margin-bottom: 15px;">${response.data.message}</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 5px 0;"><strong>Subscription ID:</strong> ${response.data.subscription_id}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">${response.data.status}</span></p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });

        // Refresh dealer data to show updated status
        fetchDealerDetails();
      } catch (error) {
        console.error('Error verifying payment:', error);
        Swal.fire({
          title: 'Verification Failed',
          text: error.response?.data?.error || 'Failed to verify payment. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setVerifyingPayment(null);
      }
    }
  };

  const deactivateMarketplace = async (ktId, dealerName) => {
    const confirmResult = await Swal.fire({
      title: 'Deactivate Marketplace Access?',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p><strong>Dealer:</strong> ${dealerName}</p>
          <p><strong>KT ID:</strong> ${ktId}</p>
          <p style="color: #ef4444; margin-top: 15px;">
            <strong>Warning:</strong> This will remove marketplace access for this dealer.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🚫 Deactivate Marketplace',
      cancelButtonText: 'Cancel'
    });

    if (confirmResult.isConfirmed) {
      setDeactivatingMarketplace(ktId);
      try {
        const accessToken = await getAccessTokenFromRefresh();
        
        const response = await axios.delete(
          `${USER_API_ENDPOINTS.ADMIN_DELETE_MARKETPLACE}${ktId}/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire({
          title: 'Marketplace Deactivated!',
          html: `
            <div style="text-align: left;">
              <p style="color: #ef4444; font-weight: 600; margin-bottom: 15px;">
                Marketplace access has been successfully deactivated for ${dealerName}
              </p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 5px 0;"><strong>Dealer:</strong> ${dealerName}</p>
                <p style="margin: 5px 0;"><strong>KT ID:</strong> ${ktId}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ef4444;">Marketplace Access Removed</span></p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });

        // Refresh dealer data to show updated status
        fetchDealerDetails();
      } catch (error) {
        console.error('Error deactivating marketplace:', error);
        
        let errorMessage = 'Failed to deactivate marketplace access. Please try again.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        Swal.fire({
          title: 'Deactivation Failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setDeactivatingMarketplace(null);
      }
    }
  };

  const addExtraDealer = async () => {
    const { value: formValues } = await Swal.fire({
      title: '🏪 Add Extra Dealer',
      html: `
        <div style="text-align: left; padding: 20px;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Name *</label>
            <input id="swal-input1" class="swal2-input" placeholder="e.g., Sneha Bansal" style="margin: 0; width: 100%;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
            <input id="swal-input2" class="swal2-input" type="email" placeholder="e.g., dealer@example.com" style="margin: 0; width: 100%;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Mobile *</label>
            <input id="swal-input3" class="swal2-input" placeholder="e.g., 701721XXXX" style="margin: 0; width: 100%;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dealing Categories *</label>
            <input id="swal-input4" class="swal2-input" placeholder="e.g., Medical,Electronics (comma-separated)" style="margin: 0; width: 100%;">
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Min Qty *</label>
              <input id="swal-input5" class="swal2-input" type="number" placeholder="5" style="margin: 0; width: 100%;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Max Qty *</label>
              <input id="swal-input6" class="swal2-input" type="number" placeholder="100" style="margin: 0; width: 100%;">
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Pincode *</label>
            <input id="swal-input7" class="swal2-input" placeholder="e.g., 110008" style="margin: 0; width: 100%;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Timing *</label>
            <input id="swal-input8" class="swal2-input" placeholder="e.g., 8:00 AM - 5:00 PM" style="margin: 0; width: 100%;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '➕ Add Dealer',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      width: '600px',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const email = document.getElementById('swal-input2').value;
        const mobile = document.getElementById('swal-input3').value;
        const dealing = document.getElementById('swal-input4').value;
        const minQty = document.getElementById('swal-input5').value;
        const maxQty = document.getElementById('swal-input6').value;
        const pincode = document.getElementById('swal-input7').value;
        const timing = document.getElementById('swal-input8').value;
        const liveLocation = "28.6139,77.2090"; // Static New Delhi coordinates

        // Validation
        if (!name || !email || !mobile || !dealing || !minQty || !maxQty || !pincode || !timing) {
          Swal.showValidationMessage('Please fill in all required fields');
          return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address');
          return false;
        }

        // Mobile validation
        if (mobile.length < 10) {
          Swal.showValidationMessage('Please enter a valid mobile number');
          return false;
        }

        return {
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          dealing: dealing.split(',').map(item => item.trim()).filter(item => item),
          min_qty: parseInt(minQty),
          max_qty: parseInt(maxQty),
          pincode: pincode.trim(),
          timing: timing.trim(),
          live_location: liveLocation.trim()
        };
      }
    });

    if (formValues) {
      setAddingDealer(true);
      try {
        const response = await axios.post(
          USER_API_ENDPOINTS.ADMIN_ADD_DEALER,
          formValues,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Dealer Added Successfully! 🎉',
            html: `
              <div style="text-align: left;">
                <p style="color: #10b981; font-weight: 600; margin-bottom: 15px;">${response.data.message}</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <p style="margin: 5px 0;"><strong>Dealer ID:</strong> ${response.data.dealer_id}</p>
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${formValues.name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${formValues.email}</p>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#10b981'
          });

          // Refresh dealer data
          fetchDealerDetails();
        }
      } catch (error) {
        console.error('Error adding dealer:', error);
        
        let errorMessage = 'Failed to add dealer. Please try again.';
        if (error.response?.data?.data?.error) {
          errorMessage = error.response.data.data.error;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        Swal.fire({
          title: 'Failed to Add Dealer',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setAddingDealer(false);
      }
    }
  };

  const getFilteredDealers = () => {
    if (!dealerData?.dealers) return [];

    let filtered = dealerData.dealers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dealer => 
        dealer.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.kt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.phone_number.includes(searchTerm)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(dealer => dealer.account_active);
        break;
      case 'inactive':
        filtered = filtered.filter(dealer => !dealer.account_active);
        break;
      case 'with_subscription':
        filtered = filtered.filter(dealer => dealer.total_subscriptions > 0);
        break;
      case 'with_marketplace':
        filtered = filtered.filter(dealer => dealer.marketplace_access);
        break;
      case 'pending_payment':
        filtered = filtered.filter(dealer => 
          dealer.latest_subscription && 
          dealer.latest_subscription.payment_transaction_id && 
          !dealer.latest_subscription.payment_verified
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const getStatusBadge = (dealer) => {
    if (!dealer.account_active) {
      return { text: 'INACTIVE', color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fca5a5' };
    } else if (dealer.marketplace_access) {
      return { text: 'MARKETPLACE', color: '#10b981', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
    } else if (dealer.current_subscription) {
      return { text: 'SUBSCRIBED', color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#93c5fd' };
    } else if (dealer.latest_subscription && dealer.latest_subscription.payment_transaction_id && !dealer.latest_subscription.payment_verified) {
      return { text: 'PAYMENT PENDING', color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fcd34d' };
    } else if (dealer.total_subscriptions > 0) {
      return { text: 'EXPIRED', color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fcd34d' };
    } else {
      return { text: 'NO SUBSCRIPTION', color: '#6b7280', bgColor: '#f8fafc', borderColor: '#d1d5db' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "400px" 
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "20px" }}>⏳</div>
            <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
              Loading dealer details...
            </p>
          </div>
        </div>
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  const filteredDealers = getFilteredDealers();

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative"
    }}>
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='6' cy='6' r='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.5,
        zIndex: 0
      }} />
      
      <Navbar />
      
      <div 
        className="container"
        style={{ 
          padding: "40px 20px",
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Modern Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "50px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          padding: "40px 30px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
        }}>
          <div className="admin-page-title">
            🏪 Marketplace Management
          </div>
          <p className="admin-page-description">
            Comprehensive dealer account management with modern tools and insights
          </p>
        </div>

        {/* Action Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "20px 30px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          flexWrap: "wrap",
          gap: "15px"
        }}>
          <Link
            to="/admin/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              color: "white",
              textDecoration: "none",
              borderRadius: "15px",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "none",
              boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(107, 114, 128, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(107, 114, 128, 0.3)";
            }}
          >
            ← Back to Dashboard
          </Link>
          
          <button
            onClick={addExtraDealer}
            disabled={addingDealer}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: addingDealer 
                ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: addingDealer ? "not-allowed" : "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: addingDealer ? 0.7 : 1,
              boxShadow: addingDealer 
                ? "0 4px 15px rgba(148, 163, 184, 0.3)" 
                : "0 4px 15px rgba(16, 185, 129, 0.3)"
            }}
            onMouseOver={(e) => {
              if (!addingDealer) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!addingDealer) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
              }
            }}
          >
            {addingDealer ? (
              <>⏳ Adding...</>
            ) : (
              <>➕ Add Extra Dealer</>
            )}
          </button>
        </div>

        {/* Modern Statistics Cards */}
        <div 
          className="admin-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            marginBottom: "40px"
          }}
        >
          {[
            {
              icon: "👥",
              value: dealerData?.total_dealers || 0,
              label: "Total Dealers",
              color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              bgPattern: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)"
            },
            {
              icon: "📊",
              value: dealerData?.dealers_with_subscriptions || 0,
              label: "With Subscriptions",
              color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              bgPattern: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)"
            },
            {
              icon: "🛒",
              value: dealerData?.dealers_with_active_access || 0,
              label: "Marketplace Access",
              color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              bgPattern: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)"
            }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "25px",
                padding: "30px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)";
              }}
            >
              {/* Background Pattern */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: stat.bgPattern,
                zIndex: 0
              }} />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ 
                  fontSize: "3rem", 
                  marginBottom: "15px",
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))"
                }}>
                  {stat.icon}
                </div>
                <h3 style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  background: stat.color,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "10px 0",
                  letterSpacing: "-0.02em"
                }}>
                  {stat.value}
                </h3>
                <p style={{
                  color: "#64748b",
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "500"
                }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Search and Filter */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          padding: "30px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            alignItems: "end"
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151"
              }}>
                🔍 Search Dealers
              </label>
              <input
                type="text"
                placeholder="Search by name, email, KT ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "15px",
                  fontSize: "16px",
                  background: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  e.target.style.background = "rgba(255, 255, 255, 1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
              />
            </div>

            {/* Filter */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151"
              }}>
                🎯 Filter
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "15px",
                  fontSize: "16px",
                  background: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  e.target.style.background = "rgba(255, 255, 255, 1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
              >
                <option value="all">All Dealers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="with_subscription">With Subscriptions</option>
                <option value="with_marketplace">Marketplace Access</option>
              </select>
            </div>
          </div>

          <div style={{
            marginTop: "20px",
            padding: "15px 20px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.2)"
          }}>
            <p style={{
              margin: 0,
              fontSize: "14px",
              color: "#1e40af",
              fontWeight: "500"
            }}>
              📊 Showing <strong>{filteredDealers.length}</strong> of <strong>{dealerData?.total_dealers || 0}</strong> dealers
            </p>
          </div>
        </div>

        {/* Modern Dealers List */}
        {loading ? (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "25px",
            padding: "60px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px"
            }} />
            <p style={{
              fontSize: "18px",
              color: "#6b7280",
              margin: 0,
              fontWeight: "500"
            }}>
              Loading dealer information...
            </p>
          </div>
        ) : filteredDealers.length === 0 ? (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "25px",
            padding: "60px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔍</div>
            <h3 style={{ 
              color: "#64748b", 
              marginBottom: "15px",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}>
              No Dealers Found
            </h3>
            <p style={{ 
              color: "#64748b",
              fontSize: "16px",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              {searchTerm || filterType !== 'all' 
                ? "Try adjusting your search or filter criteria."
                : "No dealers are registered yet."}
            </p>
          </div>
        ) : (
          <div 
            className="admin-dealers-grid"
            style={{
              display: "grid",
              gap: "25px"
            }}
          >
            {filteredDealers.map((dealer, index) => {
              const getStatusInfo = (dealer) => {
                if (!dealer.account_active) {
                  return {
                    text: "🔒 Inactive",
                    bgColor: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                    color: "#dc2626",
                    borderColor: "#fca5a5"
                  };
                } else if (dealer.marketplace_access) {
                  return {
                    text: "🚀 Active + Marketplace",
                    bgColor: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                    color: "#059669",
                    borderColor: "#6ee7b7"
                  };
                } else {
                  return {
                    text: "✅ Active",
                    bgColor: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    color: "#2563eb",
                    borderColor: "#93c5fd"
                  };
                }
              };

              const status = getStatusInfo(dealer);

              return (
                <div
                  key={dealer.dealer_id}
                  className="admin-dealer-card"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "25px",
                    padding: "30px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {/* Status Badge */}
                  <div 
                    className="status-badge"
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      background: status.bgColor,
                      color: status.color,
                      padding: "8px 16px",
                      borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    border: `2px solid ${status.borderColor}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {status.text}
                  </div>

                  <div 
                    className="admin-dealer-card-content"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "30px",
                      alignItems: "start"
                    }}
                  >
                    {/* Avatar and Basic Info */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                      <div 
                        className="admin-avatar"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "20px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                        fontWeight: "700",
                        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
                        border: "3px solid rgba(255, 255, 255, 0.5)",
                        flexShrink: 0
                      }}>
                        {dealer.dealer_name ? dealer.dealer_name.charAt(0).toUpperCase() : "D"}
                      </div>

                      <div style={{ minWidth: "0", flex: "1" }}>
                        <h3 className="dealer-name-title">
                          {dealer.dealer_name || dealer.email}
                        </h3>
                        
                        <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                          <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ color: "#3b82f6", flexShrink: 0 }}>📧</span>
                            <strong style={{ flexShrink: 0 }}>Email:</strong> 
                            <span style={{ wordBreak: "break-all", minWidth: 0 }}>{dealer.email}</span>
                          </p>
                          <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ color: "#10b981", flexShrink: 0 }}>📱</span>
                            <strong style={{ flexShrink: 0 }}>Phone:</strong> 
                            <span style={{ wordBreak: "break-all", minWidth: 0 }}>{dealer.phone_number}</span>
                          </p>
                          <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ color: "#f59e0b", flexShrink: 0 }}>🆔</span>
                            <strong style={{ flexShrink: 0 }}>KT ID:</strong> 
                            <span style={{ wordBreak: "break-all", minWidth: 0 }}>{dealer.kt_id}</span>
                          </p>
                          <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ color: "#8b5cf6", flexShrink: 0 }}>👤</span>
                            <strong style={{ flexShrink: 0 }}>Type:</strong> 
                            <span style={{ minWidth: 0 }}>{dealer.profile_type}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Info */}
                    <div style={{ minWidth: "0", flex: "1" }}>
                      <h4 style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#374151",
                        margin: "0 0 15px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        📊 Subscription Details
                      </h4>
                      
                      {dealer.current_subscription ? (
                        <div 
                          className="admin-subscription-info"
                          style={{
                          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                          padding: "20px",
                          borderRadius: "15px",
                          border: "2px solid rgba(16, 185, 129, 0.2)",
                          marginBottom: "15px"
                        }}>
                          <div style={{ fontSize: "13px", color: "#047857", lineHeight: "1.5" }}>
                            <p style={{ margin: "5px 0", fontWeight: "600" }}>
                              <strong>Current:</strong> {dealer.current_subscription.plan_name} ({dealer.current_subscription.plan_type})
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Status:</strong> 
                              <span style={{
                                color: "#059669",
                                fontWeight: "600",
                                marginLeft: "5px"
                              }}>
                                ✅ {dealer.current_subscription.status}
                              </span>
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Days Left:</strong> {dealer.current_subscription.days_remaining}
                            </p>
                            {dealer.current_subscription.user_transaction_reference && (
                              <p style={{ margin: "5px 0" }}>
                                <strong>Payment Ref:</strong> {dealer.current_subscription.user_transaction_reference}
                              </p>
                            )}
                            {dealer.current_subscription.payment_screenshot_url && (
                              <div style={{ margin: "10px 0" }}>
                                <p style={{ margin: "5px 0", fontWeight: "600" }}>
                                  <strong>Payment Screenshot:</strong>
                                </p>
                                <div className="payment-screenshot-container" style={{
                                  border: "2px solid rgba(16, 185, 129, 0.3)"
                                }}>
                                  <img 
                                    src={dealer.current_subscription.payment_screenshot_url}
                                    alt="Payment Screenshot"
                                    className="payment-screenshot-img"
                                    onClick={() => window.open(dealer.current_subscription.payment_screenshot_url, '_blank')}
                                  />
                                  <div className="payment-screenshot-overlay">
                                    🔍
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : dealer.latest_subscription ? (
                        <div 
                          className="admin-subscription-info"
                          style={{
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
                          padding: "20px",
                          borderRadius: "15px",
                          border: "2px solid rgba(245, 158, 11, 0.2)",
                          marginBottom: "15px"
                        }}>
                          <div style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
                            <p style={{ margin: "5px 0", fontWeight: "600" }}>
                              <strong>Latest:</strong> {dealer.latest_subscription.plan_name} ({dealer.latest_subscription.plan_type})
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Status:</strong> 
                              <span style={{
                                color: "#f59e0b",
                                fontWeight: "600",
                                marginLeft: "5px"
                              }}>
                                ⏳ {dealer.latest_subscription.status}
                              </span>
                            </p>
                            {dealer.latest_subscription.user_transaction_reference && (
                              <p style={{ margin: "5px 0" }}>
                                <strong>Payment Ref:</strong> {dealer.latest_subscription.user_transaction_reference}
                              </p>
                            )}
                            {dealer.latest_subscription.payment_screenshot_url && (
                              <div style={{ margin: "10px 0" }}>
                                <p style={{ margin: "5px 0", fontWeight: "600" }}>
                                  <strong>Payment Screenshot:</strong>
                                </p>
                                <div className="payment-screenshot-container" style={{
                                  border: "2px solid rgba(245, 158, 11, 0.3)"
                                }}>
                                  <img 
                                    src={dealer.latest_subscription.payment_screenshot_url}
                                    alt="Payment Screenshot"
                                    className="payment-screenshot-img"
                                    onClick={() => window.open(dealer.latest_subscription.payment_screenshot_url, '_blank')}
                                  />
                                  <div className="payment-screenshot-overlay">
                                    🔍
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="admin-subscription-info"
                          style={{
                          background: "linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)",
                          padding: "20px",
                          borderRadius: "15px",
                          border: "2px solid rgba(107, 114, 128, 0.2)",
                          marginBottom: "15px"
                        }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: "14px", 
                            color: "#6b7280",
                            textAlign: "center",
                            fontStyle: "italic"
                          }}>
                            No subscriptions yet
                          </p>
                        </div>
                      )}

                      <div 
                        className="admin-subscription-stats"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "15px",
                          fontSize: "12px",
                          color: "#64748b"
                        }}
                      >
                        <div style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          padding: "10px",
                          borderRadius: "10px",
                          textAlign: "center"
                        }}>
                          <strong style={{ color: "#2563eb" }}>Total Subscriptions</strong>
                          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e40af" }}>
                            {dealer.total_subscriptions}
                          </div>
                        </div>
                        <div style={{
                          background: dealer.marketplace_access 
                            ? "rgba(16, 185, 129, 0.1)" 
                            : "rgba(239, 68, 68, 0.1)",
                          padding: "10px",
                          borderRadius: "10px",
                          textAlign: "center"
                        }}>
                          <strong style={{ 
                            color: dealer.marketplace_access ? "#059669" : "#dc2626" 
                          }}>
                            Marketplace
                          </strong>
                          <div style={{ 
                            fontSize: "18px", 
                            fontWeight: "700",
                            color: dealer.marketplace_access ? "#047857" : "#b91c1c"
                          }}>
                            {dealer.marketplace_access ? "✅" : "❌"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div 
                      className="admin-button-container"
                      style={{ 
                        minWidth: "0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        alignItems: "stretch",
                        flexShrink: 0,
                        width: "auto",
                        maxWidth: "200px"
                      }}
                    >
                      {/* Verify Payment Button */}
                      {dealer.latest_subscription && 
                       dealer.latest_subscription.payment_transaction_id && 
                       !dealer.latest_subscription.payment_verified && (
                        <button
                          onClick={() => verifyPayment(
                            dealer.latest_subscription.payment_transaction_id,
                            dealer.dealer_name || dealer.email,
                            dealer.latest_subscription.payment_reference || dealer.latest_subscription.user_transaction_reference || 'N/A'
                          )}
                          disabled={verifyingPayment === dealer.latest_subscription.payment_transaction_id}
                          className="modern-button admin-action-button verify-payment-btn"
                          style={{
                            background: verifyingPayment === dealer.latest_subscription.payment_transaction_id 
                              ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: "white",
                            border: "none",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            cursor: verifyingPayment === dealer.latest_subscription.payment_transaction_id ? "not-allowed" : "pointer",
                            fontSize: "11px",
                            fontWeight: "600",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            opacity: verifyingPayment === dealer.latest_subscription.payment_transaction_id ? 0.7 : 1,
                            boxShadow: verifyingPayment === dealer.latest_subscription.payment_transaction_id 
                              ? "0 4px 15px rgba(148, 163, 184, 0.3)" 
                              : "0 4px 15px rgba(245, 158, 11, 0.3)",
                            width: "100%",
                            maxWidth: "160px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            minHeight: "40px"
                          }}
                          onMouseOver={(e) => {
                            if (verifyingPayment !== dealer.latest_subscription.payment_transaction_id) {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 8px 25px rgba(245, 158, 11, 0.4)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (verifyingPayment !== dealer.latest_subscription.payment_transaction_id) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 15px rgba(245, 158, 11, 0.3)";
                            }
                          }}
                        >
                          {verifyingPayment === dealer.latest_subscription.payment_transaction_id
                            ? (
                              <>
                                <span>⏳</span>
                                <span>Verifying</span>
                              </>
                            )
                            : (
                              <>
                                <span>✅</span>
                                <span>Verify</span>
                              </>
                            )
                          }
                        </button>
                      )}

                      {/* Deactivate Marketplace Button */}
                      {dealer.marketplace_access && (
                        <button
                          onClick={() => deactivateMarketplace(dealer.kt_id, dealer.dealer_name || dealer.email)}
                          disabled={deactivatingMarketplace === dealer.kt_id}
                          className="modern-button admin-action-button remove-marketplace-btn"
                          style={{
                            background: deactivatingMarketplace === dealer.kt_id 
                              ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                              : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                            color: "white",
                            border: "none",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            cursor: deactivatingMarketplace === dealer.kt_id ? "not-allowed" : "pointer",
                            fontSize: "11px",
                            fontWeight: "600",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            opacity: deactivatingMarketplace === dealer.kt_id ? 0.7 : 1,
                            boxShadow: deactivatingMarketplace === dealer.kt_id 
                              ? "0 4px 15px rgba(148, 163, 184, 0.3)" 
                              : "0 4px 15px rgba(220, 38, 38, 0.3)",
                            width: "100%",
                            maxWidth: "160px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            minHeight: "40px"
                          }}
                          onMouseOver={(e) => {
                            if (deactivatingMarketplace !== dealer.kt_id) {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.4)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (deactivatingMarketplace !== dealer.kt_id) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 15px rgba(220, 38, 38, 0.3)";
                            }
                          }}
                        >
                          {deactivatingMarketplace === dealer.kt_id
                            ? (
                              <>
                                <span>⏳</span>
                                <span>Removing</span>
                              </>
                            )
                            : (
                              <>
                                <span>🚫</span>
                                <span>Remove</span>
                              </>
                            )
                          }
                        </button>
                      )}

                      {/* Account Activation Button */}
                      <button
                        onClick={() => toggleAccountActivation(
                          dealer.auth_id, 
                          dealer.account_active
                        )}
                        disabled={processingDealer === dealer.auth_id}
                        className="modern-button admin-action-button account-activation-btn"
                        style={{
                          background: processingDealer === dealer.auth_id 
                            ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                            : dealer.account_active
                              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          cursor: processingDealer === dealer.auth_id ? "not-allowed" : "pointer",
                          fontSize: "11px",
                          fontWeight: "600",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: processingDealer === dealer.auth_id ? 0.7 : 1,
                          boxShadow: processingDealer === dealer.auth_id 
                            ? "0 4px 15px rgba(148, 163, 184, 0.3)" 
                            : dealer.account_active
                              ? "0 4px 15px rgba(239, 68, 68, 0.3)"
                              : "0 4px 15px rgba(16, 185, 129, 0.3)",
                          width: "100%",
                          maxWidth: "160px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          minHeight: "40px"
                        }}
                        onMouseOver={(e) => {
                          if (processingDealer !== dealer.auth_id) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = dealer.account_active 
                              ? "0 8px 25px rgba(239, 68, 68, 0.4)"
                              : "0 8px 25px rgba(16, 185, 129, 0.4)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingDealer !== dealer.auth_id) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = dealer.account_active 
                              ? "0 4px 15px rgba(239, 68, 68, 0.3)"
                              : "0 4px 15px rgba(16, 185, 129, 0.3)";
                          }
                        }}
                      >
                        {processingDealer === dealer.auth_id
                          ? (
                            <>
                              <span>⏳</span>
                              <span>Processing</span>
                            </>
                          )
                          : dealer.account_active
                            ? (
                              <>
                                <span>🔒</span>
                                <span>Deactivate</span>
                              </>
                            )
                            : (
                              <>
                                <span>🔓</span>
                                <span>Activate</span>
                              </>
                            )
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <MainFooter />
      <TermFooter />
    </div>
  );
};

export default AdminDealerManagement;
