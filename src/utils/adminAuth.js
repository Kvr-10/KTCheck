// Admin authentication utilities

/**
 * Check if admin OTP verification is valid for current auth token
 * @returns {boolean} - True if admin is verified for current session
 */
export const checkAdminOTPVerification = () => {
  const adminVerified = localStorage.getItem('adminOTPVerified');
  const storedAuthData = localStorage.getItem('adminVerifiedFor');
  const currentAuthData = localStorage.getItem('KTMauth');
  
  // Check if admin is verified and verification matches current auth token
  if (adminVerified === 'true' && storedAuthData === currentAuthData && currentAuthData) {
    return true;
  }
  
  // Clear stale verification data
  clearAdminOTPVerification();
  return false;
};

/**
 * Clear all admin OTP verification data
 */
export const clearAdminOTPVerification = () => {
  localStorage.removeItem('adminOTPVerified');
  localStorage.removeItem('adminVerifiedFor');
  localStorage.removeItem('adminOTPVerifiedTime');
};

/**
 * Check if user has admin access and is OTP verified
 * Redirects to appropriate page if not verified
 * @param {object} history - React Router history object
 * @returns {boolean} - True if admin access is verified
 */
export const requireAdminOTPVerification = (history) => {
  const authData = localStorage.getItem('KTMauth');
  
  if (!authData) {
    // No auth token, redirect to signin
    history.push('/signin');
    return false;
  }
  
  try {
    const parsedData = JSON.parse(authData);
    if (!parsedData.is_admin) {
      // Not an admin user
      history.push('/');
      return false;
    }
    
    if (!checkAdminOTPVerification()) {
      // Admin not OTP verified, redirect to OTP verification
      history.push('/admin/otp-verification');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    history.push('/signin');
    return false;
  }
};

/**
 * Check if current user is admin without redirecting
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  const authData = localStorage.getItem('KTMauth');
  
  if (!authData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(authData);
    return parsedData.is_admin === true;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    return false;
  }
};

/**
 * Logout function that clears all authentication and admin verification data
 * @param {object} history - React Router history object
 * @param {string} redirectTo - Path to redirect after logout (default: '/signin')
 */
export const adminLogout = (history, redirectTo = '/signin') => {
  // Clear all authentication data
  localStorage.removeItem('KTMauth');
  
  // Clear admin OTP verification
  clearAdminOTPVerification();
  
  // Clear any other session data
  sessionStorage.clear();
  
  // Clear any other relevant localStorage items
  // Add any other app-specific cleanup here
  
  // Redirect to specified path
  history.push(redirectTo);
};
