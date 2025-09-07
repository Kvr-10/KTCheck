import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import { USER_API_ENDPOINTS } from '../../utils/apis';

const AdminOTPVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const history = useHistory();

  useEffect(() => {
    // Get email from localStorage
    const authData = localStorage.getItem('KTMauth');
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        if (parsedData.is_admin && parsedData.email) {
          setEmail(parsedData.email);
          
          // Check if admin access is already verified for this login session
          const adminVerified = localStorage.getItem('adminOTPVerified');
          const storedAuthData = localStorage.getItem('adminVerifiedFor');
          
          // If admin is already verified for the current auth token, redirect to dashboard
          if (adminVerified === 'true' && storedAuthData === authData) {
            history.push('/admin/dashboard');
            return;
          }
        } else {
          // If user is not admin, redirect back
          history.push('/');
          return;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        history.push('/');
        return;
      }
    } else {
      history.push('/signin');
      return;
    }

    // Start resend timer
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, history]);

  const sendOTP = async () => {
    if (!email) {
      Swal.fire({
        title: 'Error!',
        text: 'Email not found. Please sign in again.',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(USER_API_ENDPOINTS.ADMIN_SEND_OTP, {
        email: email
      });

      if (response.status === 200) {
        setIsOtpSent(true);
        setResendTimer(60); // 60 seconds cooldown
        Swal.fire({
          title: 'Success!',
          text: response.data.message || 'OTP sent successfully to your email.',
          icon: 'success',
          confirmButtonColor: '#56b124'
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || 'Failed to send OTP. Please try again.',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter the OTP.',
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(USER_API_ENDPOINTS.ADMIN_VERIFY_OTP, {
        email: email,
        otp: parseInt(otp)
      });

      if (response.status === 200 && response.data.status === 'verified') {
        // Store admin verification tied to current auth token
        const currentAuthData = localStorage.getItem('KTMauth');
        localStorage.setItem('adminOTPVerified', 'true');
        localStorage.setItem('adminVerifiedFor', currentAuthData);
        localStorage.setItem('adminOTPVerifiedTime', Date.now().toString());
        
        Swal.fire({
          title: 'Success!',
          text: response.data.message || 'OTP verified successfully!',
          icon: 'success',
          confirmButtonColor: '#56b124',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Navigate to admin dashboard after successful verification
        setTimeout(() => {
          history.push('/admin/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please check and try again.';
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#56b124'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isOtpSent) {
        sendOTP();
      } else if (otp.length === 6) {
        verifyOTP();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    setOtp(pasteData);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Access Verification</h2>
          <p style={styles.subtitle}>
            {!isOtpSent 
              ? 'We need to verify your admin access. Click below to receive an OTP.'
              : 'Enter the 6-digit OTP sent to your email address.'
            }
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.emailSection}>
            <label style={styles.label}>Email Address:</label>
            <div style={styles.emailDisplay}>
              {email && email.replace(/(.{2})(.*)(@.*)/, '$1****$3')}
            </div>
          </div>

          {!isOtpSent ? (
            <button
              onClick={sendOTP}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onKeyPress={handleKeyPress}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <div style={styles.otpSection}>
              <label style={styles.label}>Enter OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                onPaste={handlePaste}
                placeholder="000000"
                maxLength={6}
                style={styles.otpInput}
                onKeyPress={handleKeyPress}
                autoFocus
                autoComplete="one-time-code"
              />
              
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                style={{
                  ...styles.button,
                  ...(loading || otp.length !== 6 ? styles.buttonDisabled : {})
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div style={styles.resendSection}>
                {resendTimer > 0 ? (
                  <p style={styles.resendTimer}>
                    Resend OTP in {resendTimer} seconds
                  </p>
                ) : (
                  <button
                    onClick={sendOTP}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <button
              onClick={() => history.push('/')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    color: '#2d3748',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    margin: '0 0 10px 0'
  },
  subtitle: {
    color: '#718096',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  emailSection: {
    textAlign: 'left'
  },
  label: {
    display: 'block',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  emailDisplay: {
    backgroundColor: '#f7fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    color: '#2d3748',
    fontFamily: 'monospace'
  },
  otpSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  otpInput: {
    padding: '16px',
    fontSize: '24px',
    textAlign: 'center',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    letterSpacing: '8px',
    fontFamily: 'monospace',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#56b124'
    }
  },
  button: {
    backgroundColor: '#56b124',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    cursor: 'not-allowed'
  },
  resendSection: {
    marginTop: '10px'
  },
  resendTimer: {
    color: '#718096',
    fontSize: '14px',
    margin: '0'
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#56b124',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0'
  },
  footer: {
    marginTop: '20px'
  },
  cancelButton: {
    background: 'none',
    border: '1px solid #e2e8f0',
    color: '#718096',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default AdminOTPVerification;
