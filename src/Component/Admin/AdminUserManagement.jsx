import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import styles from './AdminUserManagement.module.css';

// API endpoints
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";

const AdminUserManagement = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, inactive, admin, customer, dealer
  const [processingUser, setProcessingUser] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.ADMIN_GET_ALL_CUSTOMERS_ACCOUNT,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch user details',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmResult = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
      text: `Are you sure you want to ${action} this user account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });

    if (confirmResult.isConfirmed) {
      setProcessingUser(userId);
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

        // Refresh user data
        fetchUserDetails();
      } catch (error) {
        console.error('Error updating user status:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || `Failed to ${action} user`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setProcessingUser(null);
      }
    }
  };

  // Filter and search logic
  const getFilteredUsers = () => {
    if (!userData?.users) return [];

    let filtered = userData.users;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone_number?.toLowerCase().includes(term) ||
        user.id?.toString().includes(term)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(user => {
        switch (filterType) {
          case 'active':
            return user.is_active;
          case 'inactive':
            return !user.is_active;
          case 'admin':
            return user.is_admin;
          case 'customer':
            return user.account_type === 'Customer';
          case 'dealer':
            return user.account_type === 'Dealer';
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  const getAccountTypeIcon = (accountType) => {
    switch (accountType) {
      case 'Customer':
        return '👤';
      case 'Dealer':
        return '🏪';
      default:
        return '👑';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#10b981' : '#ef4444';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading user details...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        👥 User Management
      </h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        {[
          {
            icon: "👥",
            value: userData?.total_users || 0,
            label: "Total Users",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          },
          {
            icon: "✅",
            value: userData?.users?.filter(u => u.is_active).length || 0,
            label: "Active Users",
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          },
          {
            icon: "❌",
            value: userData?.users?.filter(u => !u.is_active).length || 0,
            label: "Inactive Users",
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          },
          {
            icon: "👑",
            value: userData?.users?.filter(u => u.is_admin).length || 0,
            label: "Admin Users",
            color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          }
        ].map((stat, index) => (
          <div
            key={index}
            className={styles.statCard}
            style={{ background: stat.color }}
          >
            <div className={styles.statIcon}>
              {stat.icon}
            </div>
            <h3 className={styles.statValue}>
              {stat.value}
            </h3>
            <p className={styles.statLabel}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchFilterGrid}>
          {/* Search */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151"
            }}>
              🔍 Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.inputBase}
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
              🔽 Filter Users
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.inputBase}
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="admin">Admin Users</option>
              <option value="customer">Customers</option>
              <option value="dealer">Dealers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div style={{ display: "grid", gap: "20px" }}>
        {filteredUsers.length === 0 ? (
          <div className={styles.noUsers}>
            {searchTerm || filterType !== 'all' ? (
              <>
                <div className={styles.noUsersIcon}>🔍</div>
                <h3>No users found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </>
            ) : (
              <>
                <div className={styles.noUsersIcon}>👥</div>
                <h3>No users available</h3>
                <p>Users will appear here once they register</p>
              </>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userCardGrid}>
                {/* Avatar and Basic Info */}
                <div className={styles.avatarSection}>
                  <div 
                    className={styles.avatar}
                    style={{
                      background: user.is_admin 
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : user.account_type === 'Dealer'
                          ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                          : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    }}
                  >
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>
                      {user.full_name || "Unknown User"}
                      {user.is_admin && (
                        <span style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "0.7rem",
                          fontWeight: "600"
                        }}>
                          ADMIN
                        </span>
                      )}
                    </h3>
                    
                    <div className={styles.userDetails}>
                      <p className={styles.userDetailItem}>
                        <span style={{ color: "#3b82f6", flexShrink: 0 }}>📧</span>
                        <strong style={{ flexShrink: 0 }}>Email:</strong> 
                        <span style={{ wordBreak: "break-all", minWidth: 0 }}>{user.email}</span>
                      </p>
                      {user.phone_number && (
                        <p className={styles.userDetailItem}>
                          <span style={{ color: "#10b981", flexShrink: 0 }}>📱</span>
                          <strong style={{ flexShrink: 0 }}>Phone:</strong> 
                          <span style={{ wordBreak: "break-all", minWidth: 0 }}>{user.phone_number}</span>
                        </p>
                      )}
                      <p className={styles.userDetailItem}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>🆔</span>
                        <strong style={{ flexShrink: 0 }}>User ID:</strong> 
                        <span style={{ wordBreak: "break-all", minWidth: 0 }}>{user.id}</span>
                      </p>
                      {user.account_type && (
                        <p className={styles.userDetailItem}>
                          <span style={{ color: "#8b5cf6", flexShrink: 0 }}>{getAccountTypeIcon(user.account_type)}</span>
                          <strong style={{ flexShrink: 0 }}>Type:</strong> 
                          <span style={{ minWidth: 0 }}>{user.account_type}</span>
                          {user.account_role && (
                            <span style={{ 
                              background: "#f3f4f6", 
                              padding: "2px 8px", 
                              borderRadius: "6px", 
                              fontSize: "12px" 
                            }}>
                              {user.account_role}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className={styles.detailsSection}>
                  <h4 className={styles.detailsTitle}>
                    📋 Account Details
                  </h4>
                  
                  <div 
                    className={styles.statusContainer}
                    style={{
                      background: user.is_active 
                        ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)"
                        : "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                      border: `2px solid ${user.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                  >
                    <div style={{ fontSize: "13px", color: user.is_active ? "#047857" : "#dc2626", lineHeight: "1.5" }}>
                      <p style={{ margin: "5px 0", fontWeight: "600" }}>
                        <strong>Status:</strong> 
                        <span style={{
                          color: getStatusColor(user.is_active),
                          fontWeight: "600",
                          marginLeft: "5px"
                        }}>
                          {user.is_active ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Joined:</strong> {new Date(user.date_joined).toLocaleDateString()}
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className={styles.desktopActions}>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    disabled={processingUser === user.id}
                    className={styles.actionButton}
                    style={{
                      background: user.is_active 
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      opacity: processingUser === user.id ? 0.7 : 1
                    }}
                  >
                    {processingUser === user.id ? (
                      "Processing..."
                    ) : (
                      user.is_active ? "🔒 Deactivate" : "🔓 Activate"
                    )}
                  </button>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className={styles.mobileActions}>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    disabled={processingUser === user.id}
                    className={styles.actionButton}
                    style={{
                      background: user.is_active 
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      opacity: processingUser === user.id ? 0.7 : 1
                    }}
                  >
                    {processingUser === user.id ? (
                      "Processing..."
                    ) : (
                      user.is_active ? "🔒 Deactivate" : "🔓 Activate"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
