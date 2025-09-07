// Admin utility functions

export const isUserAdmin = () => {
  try {
    const authData = localStorage.getItem('KTMauth');
    if (!authData) return false;
    
    const parsedData = JSON.parse(authData);
    return parsedData.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getAdminData = () => {
  try {
    const authData = localStorage.getItem('KTMauth');
    if (!authData) return null;
    
    const parsedData = JSON.parse(authData);
    return parsedData.is_admin ? parsedData : null;
  } catch (error) {
    console.error('Error getting admin data:', error);
    return null;
  }
};

export const redirectToAdminDashboard = () => {
  if (isUserAdmin()) {
    window.location.href = '/admin/dashboard';
  }
};

export const showAdminBadge = () => {
  return isUserAdmin();
};
