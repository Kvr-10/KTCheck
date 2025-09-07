import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';

// Components
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";
import WebsiteContent from "./WebsiteContent";
import CommissionManagement from "./CommissionManagement";
import AdminUserManagement from "./AdminUserManagement";
import DealerDetailsManagementNew from "./DealerDetailsManagement";
import AdminBannerManagement from "./AdminBannerManagement";
import AdminNewsManagement from "./AdminNewsManagement";
import JoinUsBannerManagement from "./JoinUsBannerManagement";

// Styles
import "../../Css/Admin.css";

// API endpoints
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";
import { requireAdminOTPVerification } from "../../utils/adminAuth";

const AdminDashboard = () => {
  const history = useHistory();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 'Loading...',
    activeDealers: 'Loading...',
    pendingPayments: 'Loading...',
    activeMarketplaces: 'Loading...'
  });

  useEffect(() => {
    // Check admin access on component mount
    if (!requireAdminOTPVerification(history)) {
      return; // Will redirect if not verified
    }

    // Get admin data from localStorage
    const authData = localStorage.getItem('KTMauth');
    if (authData) {
      const parsedData = JSON.parse(authData);
      setAdminData(parsedData);
    }
    
  // Fetch platform statistics and then clear loading
  fetchPlatformStats().finally(() => setLoading(false));
  }, [history]);

  const fetchPlatformStats = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      // Fetch dealer details for statistics
      const dealerResponse = await axios.get(
        USER_API_ENDPOINTS.ADMIN_VIEW_DEALER_DETAILS,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const dealerData = dealerResponse.data;

      // Count pending payments from dealers with "pending" status subscriptions
      const pendingPaymentsCount = dealerData.dealers ? 
        dealerData.dealers.filter(dealer => 
          dealer.latest_subscription && 
          dealer.latest_subscription.status === "pending" &&
          dealer.latest_subscription.payment_transaction_id
        ).length : 0;

      // Fetch total users from customers API
      let totalUsersCount = 'N/A';
      try {
        const usersResponse = await axios.get(
          USER_API_ENDPOINTS.ADMIN_GET_ALL_CUSTOMERS_ACCOUNT,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (usersResponse && usersResponse.data && typeof usersResponse.data.total_users !== 'undefined') {
          totalUsersCount = usersResponse.data.total_users;
        }
      } catch (uErr) {
        console.error('Error fetching total users:', uErr);
      }

      // Update statistics with real data
      setPlatformStats({
        totalUsers: totalUsersCount,
        activeDealers: dealerData.total_dealers || 0,
        pendingPayments: pendingPaymentsCount,
        activeMarketplaces: dealerData.dealers_with_active_access || 0
      });

    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Keep loading state if there's an error
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
            <div style={{ 
              fontSize: "2rem", 
              marginBottom: "20px" 
            }}>
              ⏳
            </div>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#64748b" 
            }}>
              Loading Admin Dashboard...
            </p>
          </div>
        </div>
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />
      
      <div className="admin-container">
        {/* Header Section */}
        <div className="admin-header">
          <h1 className="admin-title">
            🛡️ Admin Dashboard
          </h1>
          <p className="admin-subtitle">
            Welcome back, {adminData?.full_name}! Manage your platform from here.
          </p>
        </div>

        {/* Admin Info Card */}
        <div className="admin-card" style={{
          maxWidth: "800px",
          margin: "0 auto 40px"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            marginBottom: "20px" 
          }}>
            <div className="admin-badge">
              <span>👑</span> ADMIN ACCESS
            </div>
          </div>

          <div style={{
            backgroundColor: "#f8fafc",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "left"
          }}>
            <h3 style={{ 
              color: "#1e293b", 
              marginBottom: "15px",
              fontSize: "1.3rem"
            }}>
              👤 Account Information
            </h3>
            <div className="admin-info-grid">
              <div>
                <p style={{ margin: "8px 0" }}>
                  <strong>Name:</strong> {adminData?.full_name}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Email:</strong> {adminData?.email}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Phone:</strong> {adminData?.phone_number}
                </p>
              </div>
              <div>
                <p style={{ margin: "8px 0" }}>
                  <strong>Account Type:</strong> {adminData?.account_type}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Role:</strong> {adminData?.account_role}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>KT ID:</strong> {adminData?.kt_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'User Management', icon: '👥' },
            { id: 'dealers', label: 'Marketplace Management', icon: '🏪' },
            { id: 'dealer_details', label: 'Dealer Details', icon: '👨‍💼' },
            { id: 'content', label: 'Website Content', icon: '🌐' },
            { id: 'commission', label: 'Commission Management', icon: '💰' },
            { id: 'banners', label: 'Banner Management', icon: '🎯' },
            { id: 'joinus_banners', label: 'Internship Banners', icon: '🚀' },
            { id: 'news', label: 'News Management', icon: '📰' },
            
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = "#f1f5f9";
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
                📊 Platform Overview
              </h2>
              <div className="admin-dashboard-stats">
                {[
                  { title: 'Total Users', value: platformStats.totalUsers, icon: '👥', color: '#3b82f6' },
                  { title: 'Active Dealers', value: platformStats.activeDealers, icon: '🏪', color: '#10b981' },
                  { title: 'Pending Payments', value: platformStats.pendingPayments, icon: '💳', color: '#f59e0b' },
                  { title: 'Active Marketplaces', value: platformStats.activeMarketplaces, icon: '🛒', color: '#8b5cf6' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "25px",
                      borderRadius: "15px",
                      border: `2px solid ${stat.color}20`,
                      textAlign: "center"
                    }}
                  >
                    <div style={{
                      fontSize: "2.5rem",
                      marginBottom: "10px"
                    }}>
                      {stat.icon}
                    </div>
                    <h3 style={{
                      color: stat.color,
                      fontSize: "2rem",
                      fontWeight: "700",
                      margin: "10px 0"
                    }}>
                      {stat.value}
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "1rem",
                      margin: 0
                    }}>
                      {stat.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <AdminUserManagement />
            </div>
          )}

          {activeTab === 'dealers' && (
            <div>
              <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
                🏪 Marketplace Management
              </h2>
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "30px",
                borderRadius: "15px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🏪</div>
                <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>Marketplace Management</h3>
                <p style={{ color: "#64748b", marginBottom: "25px" }}>
                  View and manage all dealer accounts, subscriptions, and marketplace access.
                </p>
                <Link
                  to="/admin/dealers"
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#1d4ed8";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <span>👥</span> Manage Dealers
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'dealer_details' && (
            <div>
              <DealerDetailsManagementNew />
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <WebsiteContent />
            </div>
          )}

          {activeTab === 'commission' && (
            <div>
              <CommissionManagement />
            </div>
          )}

          {activeTab === 'banners' && (
            <div>
              <AdminBannerManagement />
            </div>
          )}

          {activeTab === 'joinus_banners' && (
            <div>
              <JoinUsBannerManagement />
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              <AdminNewsManagement />
            </div>
          )}

          {/* {activeTab === 'payments' && (
            <div>
              <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
                💳 Payment Verification
              </h2>
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "30px",
                borderRadius: "15px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>�</div>
                <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>Payment Management</h3>
                <p style={{ color: "#64748b", marginBottom: "25px" }}>
                  Review and verify payment submissions from dealers.
                </p>
                <Link
                  to="/admin/payments"
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#1d4ed8";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <span>🔍</span> Review Payments
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div>
              <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
                🛒 Marketplace Control
              </h2>
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "30px",
                borderRadius: "15px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🚧</div>
                <h3 style={{ color: "#64748b", marginBottom: "15px" }}>Coming Soon</h3>
                <p style={{ color: "#64748b" }}>
                  Marketplace control features will be available here. You'll be able to manage, activate, or deactivate marketplaces.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "2rem" }}>
                ⚙️ System Settings
              </h2>
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "30px",
                borderRadius: "15px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🚧</div>
                <h3 style={{ color: "#64748b", marginBottom: "15px" }}>Coming Soon</h3>
                <p style={{ color: "#64748b" }}>
                  System settings will be available here. You'll be able to configure platform settings, API configurations, and more.
                </p>
              </div>
            </div>
          )} */}
        </div>
      </div>
      
      <MainFooter />
      <TermFooter />
    </div>
  );
};

export default AdminDashboard;
