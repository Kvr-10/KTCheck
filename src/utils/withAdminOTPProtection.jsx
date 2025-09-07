import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { requireAdminOTPVerification } from './adminAuth';

/**
 * Higher-Order Component that provides admin OTP verification protection
 * @param {React.Component} WrappedComponent - The component to protect
 * @returns {React.Component} - Protected component that requires admin OTP verification
 */
const withAdminOTPProtection = (WrappedComponent) => {
  const AdminProtectedComponent = (props) => {
    const history = useHistory();

    useEffect(() => {
      // Check admin access on component mount
      if (!requireAdminOTPVerification(history)) {
        return; // Will redirect if not verified
      }
    }, [history]);

    // Render the wrapped component if admin access is verified
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AdminProtectedComponent.displayName = `withAdminOTPProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AdminProtectedComponent;
};

export default withAdminOTPProtection;
