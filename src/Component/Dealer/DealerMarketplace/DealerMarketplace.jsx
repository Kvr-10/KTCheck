import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

// Components
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// API endpoints
import { USER_API_ENDPOINTS } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";

const DealerMarketplace = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingMarketplace, setExistingMarketplace] = useState(null);
  const [isCheckingMarketplace, setIsCheckingMarketplace] = useState(true);
  const [trialEligibility, setTrialEligibility] = useState(null);
  const [isCheckingTrial, setIsCheckingTrial] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qr_code');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [dealerSubscription, setDealerSubscription] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const plans = [
    {
      id: 1,
      name: "Free Trial",
      duration: "30 days",
      price: "Free",
      originalPrice: null
    },
    {
      id: 2,
      name: "3 Months Plan",
      duration: "3 months",
      price: "₹1",
      originalPrice: null
    },
    {
      id: 3,
      name: "6 Months Plan",
      duration: "6 months",
      price: "₹2",
      originalPrice: null
    },
    {
      id: 4,
      name: "12 Months Plan",
      duration: "12 months",
      price: "₹3",
      originalPrice: null
    }
  ];

  // Check dealer subscription status
  const checkDealerSubscription = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.GET_DEALER_SUBSCRIPTION,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setDealerSubscription(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dealer subscription:', error);
      setDealerSubscription(null);
      return null;
    }
  };

  // Check payment status for a subscription
  const checkPaymentStatus = async (subscriptionId) => {
    if (!subscriptionId) return null;
    
    setIsCheckingPayment(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        `${USER_API_ENDPOINTS.GET_MARKETPLACE_PAYMENT_STATUS}${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPaymentStatus(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setPaymentStatus(null);
      return null;
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Check if dealer has pincodes set
  const checkDealerPincodes = async (dealerId) => {
    try {
      const response = await axios.get(
        USER_API_ENDPOINTS.GET_NUMBER_OF_PINCODES_DEALER_DETAILS + `${dealerId}/`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking dealer pincodes:', error);
      return null;
    }
  };

  // Check if dealer has prices set
  const checkDealerPrices = async (dealerId) => {
    try {
      const response = await axios.get(
        USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE + `${dealerId}/`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking dealer prices:', error);
      return null;
    }
  };

  // Validate dealer setup before creating marketplace
  const validateDealerSetup = async (dealerId) => {
    try {
      // Check pincodes
      const pincodeData = await checkDealerPincodes(dealerId);
      if (!pincodeData || pincodeData.no_of_pincodes === 0) {
        return {
          isValid: false,
          issue: 'pincodes',
          message: 'No service areas (pincodes) found',
          redirectUrl: '/dealer/settings/addarea'
        };
      }

      // Check prices
      const priceData = await checkDealerPrices(dealerId);
      if (!priceData || (Array.isArray(priceData) && priceData.length === 0)) {
        return {
          isValid: false,
          issue: 'prices',
          message: 'No prices set for scrap items',
          redirectUrl: '/dealer/settings/setprice'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating dealer setup:', error);
      return {
        isValid: false,
        issue: 'error',
        message: 'Unable to validate your setup. Please try again.'
      };
    }
  };

  // Create marketplace when subscription is active
  const createMarketplaceForActiveSubscription = async (ktid) => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.post(
        USER_API_ENDPOINTS.CREATE_DEALER_MARKETPLACE,
        {
          dealer_ktid: ktid
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating marketplace:', error);
      return null;
    }
  };

  // Check for existing marketplace on component mount
  useEffect(() => {
    const initializeMarketplace = async () => {
      setIsCheckingMarketplace(true);
      try {
        // Get ktid from localStorage
        const authData = localStorage.getItem('KTMauth');
        if (!authData) {
          console.log('No auth data found in localStorage');
          setExistingMarketplace(null);
          setIsCheckingMarketplace(false);
          return;
        }

        const parsedAuthData = JSON.parse(authData);
        const ktid = parsedAuthData.kt_id;
        
        if (!ktid) {
          console.log('No ktid found in auth data');
          setExistingMarketplace(null);
          setIsCheckingMarketplace(false);
          return;
        }

        // First check if marketplace already exists
        try {
          const accessToken = await getAccessTokenFromRefresh();
          
          const marketplaceResponse = await axios.get(
            `${USER_API_ENDPOINTS.GET_DEALER_MARKETPLACE}${ktid}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (marketplaceResponse.data && marketplaceResponse.data.status === 'active') {
            setExistingMarketplace(marketplaceResponse.data);
            setIsCheckingMarketplace(false);
            return;
          }
        } catch (marketplaceError) {
          console.log('No existing marketplace found, checking subscription status...');
        }

        // Check dealer subscription status
        const subscriptionData = await checkDealerSubscription();
        
        if (!subscriptionData) {
          setIsCheckingMarketplace(false);
          return;
        }

        // If has active subscription, only check if marketplace exists (don't auto-create)
        if (subscriptionData.has_active_subscription && subscriptionData.subscription) {
          try {
            // Try to get existing marketplace
            const accessToken = await getAccessTokenFromRefresh();
            const marketplaceResponse = await axios.get(
              `${USER_API_ENDPOINTS.GET_DEALER_MARKETPLACE}${ktid}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (marketplaceResponse.data && marketplaceResponse.data.status === 'active') {
              setExistingMarketplace(marketplaceResponse.data);
            }
          } catch (error) {
            // If marketplace doesn't exist, don't auto-create it
            // Let the user manually create it through the UI
            console.log('No marketplace found for active subscription. User needs to create manually.');
            setExistingMarketplace(null);
          }
        }
        // If subscription exists but not active, check payment status
        else if (subscriptionData.last_subscription) {
          const paymentData = await checkPaymentStatus(subscriptionData.last_subscription.id);
          
          if (paymentData && paymentData.subscription_status === 'active') {
            // If payment is verified and subscription is active, only check for existing marketplace
            try {
              const accessToken = await getAccessTokenFromRefresh();
              const marketplaceResponse = await axios.get(
                `${USER_API_ENDPOINTS.GET_DEALER_MARKETPLACE}${ktid}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (marketplaceResponse.data && marketplaceResponse.data.status === 'active') {
                setExistingMarketplace(marketplaceResponse.data);
              }
            } catch (error) {
              console.log('No marketplace found for verified payment. User needs to create manually.');
              setExistingMarketplace(null);
            }
          }
        }

      } catch (error) {
        console.error('Error in marketplace initialization:', error);
        setExistingMarketplace(null);
      } finally {
        setIsCheckingMarketplace(false);
      }
    };

    initializeMarketplace();
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Check trial eligibility
  const checkTrialEligibility = async () => {
    setIsCheckingTrial(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.DEALER_TRIAL_ELIGIBILITY,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTrialEligibility(response.data);
      return response.data;
    } catch (error) {
      console.error('Trial eligibility check error:', error);
      setTrialEligibility(null);
      return null;
    } finally {
      setIsCheckingTrial(false);
    }
  };

  // Fetch bank details for payment
  const fetchBankDetails = async () => {
    setIsLoadingBankDetails(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.get(
        USER_API_ENDPOINTS.GET_BANK_DETAILS,
      );

      setBankDetails(response.data);
      
      // Generate QR code for the selected plan
      if (selectedPlan && response.data) {
        const planKey = `plan_${selectedPlan.id}`;
        const upiString = response.data[planKey];
        
        if (upiString) {
          try {
            // First generate the QR code
            const qrDataUrl = await QRCode.toDataURL(upiString, {
              width: 300,
              margin: 2,
              errorCorrectionLevel: 'H', // High error correction to allow for logo overlay
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });

            // Create a canvas to combine QR code with logo
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;

            // Load and draw the QR code
            const qrImage = new Image();
            qrImage.onload = () => {
              ctx.drawImage(qrImage, 0, 0, 300, 300);

              // Load and draw the logo in the center
              const logoImage = new Image();
              logoImage.onload = () => {
                const logoSize = 60; // Size of the logo
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = (canvas.height - logoSize) / 2;

                // Draw white background circle for the logo
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
                ctx.fill();

                // Draw the logo
                ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

                // Convert canvas to data URL
                const finalQrDataUrl = canvas.toDataURL('image/png');
                setQrCodeDataUrl(finalQrDataUrl);
              };

              logoImage.onerror = () => {
                // If logo fails to load, use QR code without logo
                console.warn('Logo failed to load, using QR code without logo');
                setQrCodeDataUrl(qrDataUrl);
              };

              logoImage.src = '/Kabadi_Techno_logo.png'; 
            };

            qrImage.onerror = () => {
              console.error('QR Code image failed to load');
              setQrCodeDataUrl('');
            };

            qrImage.src = qrDataUrl;

          } catch (error) {
            console.error('QR Code generation error:', error);
            setQrCodeDataUrl('');
          }
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Bank details fetch error:', error);
      setBankDetails(null);
      return null;
    } finally {
      setIsLoadingBankDetails(false);
    }
  };

  // Handle screenshot upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit payment details
  const submitPayment = async () => {
    if (!subscriptionId || !transactionId.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a transaction ID',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      // Calculate amount based on selected plan
      let amount = 0;
      if (selectedPlan && selectedPlan.price !== 'Free') {
        amount = parseFloat(selectedPlan.price.replace('₹', ''));
      }
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('subscription', subscriptionId);
      formData.append('transaction_id', transactionId);
      formData.append('amount', amount);
      formData.append('payment_method', paymentMethod);
      
      // Add screenshot if provided
      if (paymentScreenshot) {
        formData.append('payment_screenshot', paymentScreenshot);
      }
      
      const response = await axios.post(
        USER_API_ENDPOINTS.MARKETPLACE_PAYMENT,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Show success message
      Swal.fire({
        title: 'Payment Submitted Successfully!',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 15px; color: #10b981; font-weight: 600;">${response.data.message}</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b;">Payment Transaction Details:</h4>
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${response.data.payment_transaction.transaction_id}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${response.data.payment_transaction.amount}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${response.data.payment_transaction.payment_method}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">${response.data.status}</span></p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">Your payment is currently under verification. You will receive confirmation once approved by our admin team.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        allowOutsideClick: false,
        width: '500px'
      }).then(() => {
        // Reset states and close modals
        setShowPaymentModal(false);
        setShowConfirmation(false);
        setSelectedPlan(null);
        setTransactionId('');
        setPaymentScreenshot(null);
        setScreenshotPreview(null);
        setSubscriptionId(null);
        window.location.reload(); 
      });

    } catch (error) {
      console.error('Payment submission error:', error);
      
      Swal.fire({
        title: 'Payment Submission Failed',
        text: error.response?.data?.error || 'Failed to submit payment details. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleStartPlan = async () => {
    if (selectedPlan) {
      // If it's a free trial, check eligibility first
      if (selectedPlan.id === 1) {
        const eligibility = await checkTrialEligibility();
        
        if (eligibility && !eligibility.trial_eligible) {
          // User has already used their free trial
          Swal.fire({
            title: 'Free Trial Already Used',
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: 15px;">${eligibility.message}</p>
                
                ${eligibility.previous_trial ? `
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 10px 0; color: #1e293b;">Previous Trial Details:</h4>
                    <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(eligibility.previous_trial.start_date).toLocaleDateString()}</p>
                    <p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(eligibility.previous_trial.end_date).toLocaleDateString()}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${eligibility.previous_trial.status === 'active' ? '#10b981' : '#ef4444'};">${eligibility.previous_trial.status}</span></p>
                  </div>
                ` : ''}
                
                <p style="margin-top: 15px; color: #64748b;">Please choose one of our paid plans to continue.</p>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'Choose Paid Plan',
            confirmButtonColor: '#3b82f6',
            allowOutsideClick: false,
            width: '500px'
          });
          
          // Reset selected plan so user can choose a different one
          setSelectedPlan(null);
          return;
        } else if (eligibility && eligibility.trial_eligible) {
          // User is eligible for free trial, show success message
          Swal.fire({
            title: 'Great! You\'re eligible for Free Trial',
            text: 'You can start your 30-day free trial now.',
            icon: 'success',
            confirmButtonText: 'Start Free Trial',
            confirmButtonColor: '#10b981',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#6b7280'
          }).then((result) => {
            if (result.isConfirmed) {
              setShowConfirmation(true);
            } else {
              setSelectedPlan(null);
            }
          });
          return;
        } else {
          // Error checking eligibility
          Swal.fire({
            title: 'Error',
            text: 'Unable to check trial eligibility. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          setSelectedPlan(null);
          return;
        }
      } else {
        // For paid plans, fetch bank details and show QR dialog first
        const bankData = await fetchBankDetails();
        if (bankData) {
          setShowQRDialog(true);
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Unable to fetch payment details. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
          setSelectedPlan(null);
        }
      }
    }
  };

  // Handle next button from QR dialog - create subscription and show payment form
  const handleQRNext = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getAccessTokenFromRefresh();
      
      const response = await axios.post(
        USER_API_ENDPOINTS.DEALER_SUBSCRIPTION,
        {
          plan_id: selectedPlan.id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.subscription) {
        setSubscriptionId(response.data.subscription.id);
        setShowQRDialog(false);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || 'Failed to create subscription. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (confirmed) => {
    if (confirmed && selectedPlan && selectedPlan.id === 1) {
      // Only handle free trial confirmation
      setIsLoading(true);
      setError(null);
      
      try {
        const accessToken = await getAccessTokenFromRefresh();
        
        const response = await axios.post(
          USER_API_ENDPOINTS.DEALER_SUBSCRIPTION,
          {
            plan_id: selectedPlan.id
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Success response for free trial
        if (response.data.message) {
          // After successful subscription, create marketplace
          try {
            const marketplaceResponse = await axios.post(
              USER_API_ENDPOINTS.CREATE_DEALER_MARKETPLACE,
              {
                dealer_ktid: response.data.subscription.dealer_ktid
              }
            );

            // Show success with both subscription and marketplace info
            Swal.fire({
              title: 'Success!',
              html: `
                <div style="text-align: left;">
                  <h4 style="color: #10b981; margin-bottom: 15px;">🎉 Free Trial Started</h4>
                  <p><strong>Plan:</strong> ${response.data.subscription.plan_name}</p>
                  <p><strong>Status:</strong> ${response.data.subscription.status}</p>
                  <p><strong>Days Remaining:</strong> ${response.data.subscription.days_remaining}</p>
                  <p><strong>Start Date:</strong> ${new Date(response.data.subscription.start_date).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> ${new Date(response.data.subscription.end_date).toLocaleDateString()}</p>
                  
                  <hr style="margin: 20px 0; border: 1px solid #e2e8f0;">
                  
                  <h4 style="color: #3b82f6; margin-bottom: 15px;">🏪 Marketplace Created</h4>
                  <p><strong>Marketplace ID:</strong> ${marketplaceResponse.data.marketplace_id}</p>
                  <p><strong>Frontend URL:</strong> <a href="${marketplaceResponse.data.frontend_url}" target="_blank" style="color: #3b82f6;">${marketplaceResponse.data.frontend_url}</a></p>
                  <p><strong>QR Display URL:</strong> <a href="${marketplaceResponse.data.qr_display_url}" target="_blank" style="color: #3b82f6;">View QR Code</a></p>
                  <p><strong>Expires:</strong> ${new Date(marketplaceResponse.data.subscription_expires).toLocaleDateString()}</p>
                </div>
              `,
              icon: 'success',
              confirmButtonText: 'Great!',
              confirmButtonColor: '#10b981',
              allowOutsideClick: false,
              width: '600px'
            }).then(() => {
              window.location.reload();
            });

          } catch (marketplaceError) {
            console.error('Marketplace Creation Error:', marketplaceError);
            
            // Show subscription success but marketplace creation failure
            Swal.fire({
              title: 'Partial Success',
              html: `
                <div style="text-align: left;">
                  <h4 style="color: #10b981; margin-bottom: 15px;">✅ Subscription Created Successfully</h4>
                  <p><strong>Plan:</strong> ${response.data.subscription.plan_name}</p>
                  <p><strong>Status:</strong> ${response.data.subscription.status}</p>
                  <p><strong>Days Remaining:</strong> ${response.data.subscription.days_remaining}</p>
                  
                  <hr style="margin: 20px 0; border: 1px solid #e2e8f0;">
                  
                  <h4 style="color: #f59e0b; margin-bottom: 15px;">⚠️ Marketplace Creation Issue</h4>
                  <p>Your subscription is active, but there was an issue creating your marketplace. Please contact support or try again later.</p>
                  ${marketplaceError.response?.data?.error ? `<p><strong>Error:</strong> ${marketplaceError.response.data.error}</p>` : ''}
                </div>
              `,
              icon: 'warning',
              confirmButtonText: 'OK',
              confirmButtonColor: '#f59e0b',
              allowOutsideClick: false,
              width: '600px'
            });
          }
        }
        
      } catch (error) {
        console.error('Subscription API Error:', error);
        
        if (error.response?.data?.error) {
          setError(error.response.data.error);
          Swal.fire({
            title: 'Error!',
            text: error.response.data.error,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
        } else if (error.response?.data?.detail) {
          setError(error.response.data.detail);
          Swal.fire({
            title: 'Error!',
            text: error.response.data.detail,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
        } else {
          setError('Failed to create subscription. Please try again.');
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create subscription. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  // If checking for existing marketplace, show loading
  if (isCheckingMarketplace) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <DealerProfileSearchbar />
        <DealerProfileNavbar />
        
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
              Checking your subscription and marketplace status...
            </p>
          </div>
        </div>
        
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  // If payment is pending verification, show payment status
  if (paymentStatus && paymentStatus.payment_submitted && !paymentStatus.payment_verified && paymentStatus.subscription_status === 'pending') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <DealerProfileSearchbar />
        <DealerProfileNavbar />
        
        <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ 
              fontSize: "3rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "16px"
            }}>
              Payment Under Verification
            </h1>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Your payment has been submitted successfully and is currently being verified
            </p>
          </div>

          {/* Payment Status Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            border: "2px solid #e2e8f0",
            maxWidth: "800px",
            margin: "0 auto 40px"
          }}>
            {/* Status Badge */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: "30px" 
            }}>
              <div style={{
                backgroundColor: "#f59e0b",
                color: "white",
                padding: "12px 24px",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "600",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>⏳</span> VERIFICATION PENDING
              </div>
            </div>

            {/* Payment Details */}
            <div style={{
              backgroundColor: "#fef3c7",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px",
              border: "1px solid #fbbf24"
            }}>
              <h3 style={{ 
                color: "#92400e", 
                marginBottom: "20px",
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span>💰</span> Payment Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Transaction ID:</strong> {paymentStatus.payment_details.transaction_id}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Amount:</strong> ₹{paymentStatus.payment_details.amount}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Payment Method:</strong> {paymentStatus.payment_details.payment_method}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Plan:</strong> {paymentStatus.payment_details.subscription_plan}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: paymentStatus.payment_verified ? "#10b981" : "#f59e0b",
                      fontWeight: "600",
                      marginLeft: "8px"
                    }}>
                      {paymentStatus.payment_verified ? "✅ Verified" : "⏳ Pending"}
                    </span>
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Submitted:</strong> {new Date(paymentStatus.payment_details.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div style={{
              backgroundColor: "#e0f2fe",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px",
              border: "1px solid #0284c7"
            }}>
              <h4 style={{ 
                color: "#0369a1", 
                marginBottom: "15px",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>ℹ️</span> What happens next?
              </h4>
              <ul style={{ 
                color: "#0369a1", 
                lineHeight: "1.6",
                paddingLeft: "20px",
                margin: 0
              }}>
                <li>Our admin team will verify your payment within 24-48 hours</li>
                <li>Once verified, your subscription will be activated automatically</li>
                <li>Your marketplace will be created and you'll receive access</li>
                <li>You'll receive email notification upon approval</li>
              </ul>
            </div>

            {/* Action Button */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center",
              gap: "20px"
            }}>
              <button
                onClick={async () => {
                  if (dealerSubscription?.last_subscription?.id) {
                    const statusResult = await checkPaymentStatus(dealerSubscription.last_subscription.id);
                    if (statusResult && statusResult.payment_verified) {
                      window.location.reload();
                    }
                  }
                }}
                disabled={isCheckingPayment}
                style={{
                  backgroundColor: isCheckingPayment ? "#94a3b8" : "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "15px 30px",
                  borderRadius: "50px",
                  cursor: isCheckingPayment ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isCheckingPayment ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isCheckingPayment) {
                    e.target.style.backgroundColor = "#1d4ed8";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isCheckingPayment) {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {isCheckingPayment ? (
                  <>
                    <span>⏳</span> Checking Status...
                  </>
                ) : (
                  <>
                    <span>🔄</span> Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contact Support Card */}
          <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "15px",
            padding: "25px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            <h4 style={{ 
              color: "#1e293b", 
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span>📞</span> Need Help?
            </h4>
            <p style={{ 
              color: "#64748b", 
              marginBottom: "15px",
              lineHeight: "1.6"
            }}>
              If you have any questions about your payment or need assistance, please contact our support team.
            </p>
            <p style={{ 
              color: "#3b82f6", 
              fontWeight: "600",
              margin: 0
            }}>
              📧 support@kabadi-techno.com | 📱 +91-XXXXXXXXXX
            </p>
          </div>
        </div>
        
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  // If existing marketplace found, show marketplace details
  if (existingMarketplace) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <DealerProfileSearchbar />
        <DealerProfileNavbar />
        
        <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ 
              fontSize: "3rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "16px"
            }}>
              Your Active Marketplace
            </h1>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Your marketplace is active and ready to serve customers
            </p>
          </div>

          {/* Marketplace Details Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            border: "2px solid #e2e8f0",
            maxWidth: "800px",
            margin: "0 auto 40px"
          }}>
            {/* Status Badge */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: "30px" 
            }}>
              <div style={{
                backgroundColor: existingMarketplace.status === 'active' ? "#10b981" : "#f59e0b",
                color: "white",
                padding: "10px 20px",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "600",
                textTransform: "uppercase"
              }}>
                ✅ {existingMarketplace.status}
              </div>
            </div>

            {/* Dealer Info */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
              <h2 style={{ 
                color: "#1e293b", 
                marginBottom: "10px",
                fontSize: "2rem"
              }}>
                {existingMarketplace.dealer_name}
              </h2>
              <p style={{ 
                color: "#64748b", 
                fontSize: "1.1rem" 
              }}>
                {existingMarketplace.dealer_profile_type} • ID: {existingMarketplace.kt_id}
              </p>
            </div>

            {/* Subscription Info */}
            <div style={{
              backgroundColor: "#f8fafc",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px"
            }}>
              <h3 style={{ 
                color: "#1e293b", 
                marginBottom: "15px",
                fontSize: "1.3rem"
              }}>
                📋 Subscription Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p><strong>Type:</strong> {existingMarketplace.subscription_type}</p>
                  <p><strong>Days Remaining:</strong> {existingMarketplace.days_remaining} days</p>
                </div>
                <div>
                  <p><strong>End Date:</strong> {new Date(existingMarketplace.end_duration).toLocaleDateString()}</p>
                  <p><strong>Access:</strong> {existingMarketplace.access_granted ? "✅ Granted" : "❌ Denied"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              gap: "20px", 
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <a
                href={existingMarketplace.frontend_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "15px 30px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  display: "inline-block"
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
                🌐 Visit Marketplace
              </a>
              
              <a
                href={existingMarketplace.qr_display_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "15px 30px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  display: "inline-block"
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#059669";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#10b981";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📱 View QR Code
              </a>
            </div>
          </div>

          {/* Renewal Notice if subscription is expiring soon */}
          {existingMarketplace.days_remaining <= 7 && (
            <div style={{
              backgroundColor: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              <h3 style={{ 
                color: "#92400e", 
                marginBottom: "10px" 
              }}>
                ⚠️ Subscription Expiring Soon
              </h3>
              <p style={{ 
                color: "#92400e", 
                marginBottom: "20px" 
              }}>
                Your subscription expires in {existingMarketplace.days_remaining} days. Renew to keep your marketplace active.
              </p>
              <button
                onClick={() => {
                  setExistingMarketplace(null);
                  setIsCheckingMarketplace(false);
                }}
                style={{
                  backgroundColor: "#f59e0b",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600"
                }}
              >
                🔄 Renew Subscription
              </button>
            </div>
          )}
        </div>
        
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  // If there's a subscription but no marketplace and payment is pending, show subscription details
  if (dealerSubscription && dealerSubscription.last_subscription && 
      !dealerSubscription.has_active_subscription && 
      paymentStatus && paymentStatus.payment_submitted && !paymentStatus.payment_verified) {
    
    const subscription = dealerSubscription.last_subscription;
    
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <DealerProfileSearchbar />
        <DealerProfileNavbar />
        
        <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ 
              fontSize: "3rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "16px"
            }}>
              Complete Your Payment
            </h1>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              You have a pending subscription. Complete the payment to activate your marketplace.
            </p>
          </div>

          {/* Subscription Details Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            border: "2px solid #e2e8f0",
            maxWidth: "800px",
            margin: "0 auto 40px"
          }}>
            {/* Status Badge */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: "30px" 
            }}>
              <div style={{
                backgroundColor: "#ef4444",
                color: "white",
                padding: "12px 24px",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "600",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>⚠️</span> PAYMENT REQUIRED
              </div>
            </div>

            {/* Subscription Info */}
            <div style={{
              backgroundColor: "#fef2f2",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px",
              border: "1px solid #fca5a5"
            }}>
              <h3 style={{ 
                color: "#dc2626", 
                marginBottom: "20px",
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span>📋</span> Subscription Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Plan:</strong> {subscription.plan_name}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Type:</strong> {subscription.plan_type}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: "#ef4444",
                      fontWeight: "600",
                      marginLeft: "8px"
                    }}>
                      {subscription.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Created:</strong> {new Date(subscription.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Duration:</strong> {subscription.days_remaining} days total
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Trial:</strong> {subscription.is_trial ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div style={{
              backgroundColor: "#f0f9ff",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px",
              border: "1px solid #0ea5e9"
            }}>
              <h4 style={{ 
                color: "#0284c7", 
                marginBottom: "15px",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>💡</span> Next Steps
              </h4>
              <ul style={{ 
                color: "#0284c7", 
                lineHeight: "1.6",
                paddingLeft: "20px",
                margin: 0
              }}>
                <li>Complete the payment for your selected plan</li>
                <li>Submit transaction details for verification</li>
                <li>Once verified, your marketplace will be activated</li>
                <li>Start receiving customers and growing your business</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={async () => {
                  // Find the matching plan and set it as selected
                  const matchingPlan = plans.find(plan => {
                    if (subscription.plan_type === '3_month') return plan.id === 2;
                    if (subscription.plan_type === '6_month') return plan.id === 3;
                    if (subscription.plan_type === '12_month') return plan.id === 4;
                    return false;
                  });
                  
                  if (matchingPlan) {
                    setSelectedPlan(matchingPlan);
                    const bankData = await fetchBankDetails();
                    if (bankData) {
                      setQrCodeDataUrl('');
                      // Generate QR code for the selected plan
                      const planKey = `plan_${matchingPlan.id}`;
                      const upiString = bankData[planKey];
                      
                      if (upiString) {
                        try {
                          const qrDataUrl = await QRCode.toDataURL(upiString, {
                            width: 200,
                            margin: 2,
                            color: {
                              dark: '#000000',
                              light: '#FFFFFF'
                            }
                          });
                          setQrCodeDataUrl(qrDataUrl);
                        } catch (error) {
                          console.error('QR Code generation error:', error);
                        }
                      }
                      setSubscriptionId(subscription.id);
                      setShowPaymentModal(true);
                    }
                  }
                }}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "15px 30px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#059669";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#10b981";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <span>💳</span> Complete Payment
              </button>
              
              <button
                onClick={async () => {
                  const subscriptionData = await checkDealerSubscription();
                  if (subscriptionData?.last_subscription?.id) {
                    await checkPaymentStatus(subscriptionData.last_subscription.id);
                  }
                }}
                disabled={isCheckingPayment}
                style={{
                  backgroundColor: isCheckingPayment ? "#94a3b8" : "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "15px 30px",
                  borderRadius: "50px",
                  cursor: isCheckingPayment ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isCheckingPayment ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isCheckingPayment) {
                    e.target.style.backgroundColor = "#1d4ed8";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isCheckingPayment) {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {isCheckingPayment ? (
                  <>
                    <span>⏳</span> Checking...
                  </>
                ) : (
                  <>
                    <span>🔄</span> Check Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  // If dealer has active subscription but no marketplace (maybe admin deleted it), show create marketplace option
  if (dealerSubscription && dealerSubscription.has_active_subscription && !existingMarketplace) {
    const subscription = dealerSubscription.subscription;
    
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <DealerProfileSearchbar />
        <DealerProfileNavbar />
        
        <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ 
              fontSize: "3rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "16px"
            }}>
              🏪 Create Your Marketplace
            </h1>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#64748b", 
              maxWidth: "600px", 
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              You have an active subscription but no marketplace. Create your marketplace to start serving customers.
            </p>
          </div>

          {/* Subscription Status Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            border: "2px solid #e2e8f0",
            maxWidth: "800px",
            margin: "0 auto 40px"
          }}>
            {/* Status Badge */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: "30px" 
            }}>
              <div style={{
                backgroundColor: "#10b981",
                color: "white",
                padding: "12px 24px",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "600",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>✅</span> SUBSCRIPTION ACTIVE
              </div>
            </div>

            {/* Subscription Details */}
            <div style={{
              backgroundColor: "#f0fdf4",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "30px",
              border: "1px solid #bbf7d0"
            }}>
              <h3 style={{ 
                color: "#166534", 
                marginBottom: "20px",
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span>📊</span> Subscription Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Plan:</strong> {subscription.plan_name}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Status:</strong> <span style={{ color: "#10b981" }}>{subscription.status}</span>
                  </p>
                </div>
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Days Remaining:</strong> {subscription.days_remaining}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Create Marketplace Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={async () => {
                  const authData = localStorage.getItem('KTMauth');
                  if (authData) {
                    const parsedAuthData = JSON.parse(authData);
                    const ktid = parsedAuthData.kt_id;
                    const dealerId = parsedAuthData.dealer_id;
                    
                    if (ktid && dealerId) {
                      setIsLoading(true);
                      try {
                        // First validate dealer setup
                        const validation = await validateDealerSetup(dealerId);
                        
                        if (!validation.isValid) {
                          setIsLoading(false);
                          
                          if (validation.issue === 'pincodes') {
                            Swal.fire({
                              title: 'Setup Required: Service Areas',
                              html: `
                                <div style="text-align: left;">
                                  <p style="margin-bottom: 20px; color: #dc2626; font-weight: 600;">${validation.message}</p>
                                  
                                  <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                                    <h4 style="margin: 0 0 15px 0; color: #92400e;">📍 Why Service Areas are Important:</h4>
                                    <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                                      <li>Customers can find your services in their area</li>
                                      <li>You can manage pickup schedules efficiently</li>
                                      <li>Your marketplace will be visible to local users</li>
                                      <li>Required for marketplace functionality</li>
                                    </ul>
                                  </div>
                                  
                                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                                    Please add at least one service area (pincode) before creating your marketplace.
                                  </p>
                                </div>
                              `,
                              icon: 'warning',
                              confirmButtonText: 'Add Service Areas',
                              confirmButtonColor: '#f59e0b',
                              showCancelButton: true,
                              cancelButtonText: 'Cancel',
                              cancelButtonColor: '#6b7280',
                              allowOutsideClick: false,
                              width: '550px'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                window.location.href = validation.redirectUrl;
                              }
                            });
                          } else if (validation.issue === 'prices') {
                            Swal.fire({
                              title: 'Setup Required: Item Prices',
                              html: `
                                <div style="text-align: left;">
                                  <p style="margin-bottom: 20px; color: #dc2626; font-weight: 600;">${validation.message}</p>
                                  
                                  <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                                    <h4 style="margin: 0 0 15px 0; color: #92400e;">💰 Why Prices are Important:</h4>
                                    <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                                      <li>Customers can see rates for different scrap items</li>
                                      <li>Transparent pricing builds customer trust</li>
                                      <li>Helps customers estimate their earnings</li>
                                      <li>Required for marketplace functionality</li>
                                    </ul>
                                  </div>
                                  
                                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                                    Please set prices for scrap items before creating your marketplace.
                                  </p>
                                </div>
                              `,
                              icon: 'warning',
                              confirmButtonText: 'Set Item Prices',
                              confirmButtonColor: '#f59e0b',
                              showCancelButton: true,
                              cancelButtonText: 'Cancel',
                              cancelButtonColor: '#6b7280',
                              allowOutsideClick: false,
                              width: '550px'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                window.location.href = validation.redirectUrl;
                              }
                            });
                          } else {
                            Swal.fire({
                              title: 'Validation Error',
                              text: validation.message,
                              icon: 'error',
                              confirmButtonColor: '#ef4444'
                            });
                          }
                          return;
                        }

                        // If validation passes, create marketplace
                        const newMarketplace = await createMarketplaceForActiveSubscription(ktid);
                        if (newMarketplace) {
                          Swal.fire({
                            title: 'Marketplace Created Successfully!',
                            html: `
                              <div style="text-align: left;">
                                <p style="margin-bottom: 20px; color: #10b981; font-weight: 600;">🎉 Your marketplace is now active!</p>
                                
                                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                                  <h4 style="margin: 0 0 15px 0; color: #166534;">📊 Marketplace Details:</h4>
                                  <p style="margin: 5px 0; color: #166534;"><strong>Marketplace ID:</strong> ${newMarketplace.marketplace_id}</p>
                                  <p style="margin: 5px 0; color: #166534;"><strong>Status:</strong> Active</p>
                                  <p style="margin: 5px 0; color: #166534;"><strong>Frontend URL:</strong> <a href="${newMarketplace.frontend_url}" target="_blank" style="color: #3b82f6;">${newMarketplace.frontend_url}</a></p>
                                </div>
                                
                                <p style="color: #64748b; font-size: 14px; margin: 0;">
                                  Your marketplace is ready to serve customers. Start promoting your services!
                                </p>
                              </div>
                            `,
                            icon: 'success',
                            confirmButtonText: 'Great!',
                            confirmButtonColor: '#10b981',
                            allowOutsideClick: false,
                            width: '600px'
                          }).then(() => {
                            window.location.reload();
                          });
                        } else {
                          throw new Error('Failed to create marketplace');
                        }
                      } catch (error) {
                        console.error('Error creating marketplace:', error);
                        Swal.fire({
                          title: 'Error',
                          text: 'Failed to create marketplace. Please try again.',
                          icon: 'error',
                          confirmButtonColor: '#ef4444'
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }
                }}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? "#94a3b8" : "#10b981",
                  color: "white",
                  border: "none",
                  padding: "16px 40px",
                  borderRadius: "30px",
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "0 auto",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                    Creating Marketplace...
                  </>
                ) : (
                  <>
                    <span>🏪</span>
                    Create My Marketplace
                  </>
                )}
              </button>
              
              <p style={{ 
                fontSize: "14px", 
                color: "#64748b", 
                marginTop: "15px",
                maxWidth: "500px",
                margin: "15px auto 0"
              }}>
                This will create your marketplace with the current active subscription. You can start serving customers immediately after creation.
              </p>
            </div>
          </div>
        </div>
        
        <MainFooter />
        <TermFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />
      
      <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "700", 
            color: "#1e293b", 
            marginBottom: "16px"
          }}>
            Choose Your Marketplace Plan
          </h1>
          <p style={{ 
            fontSize: "1.2rem", 
            color: "#64748b", 
            maxWidth: "600px", 
            margin: "0 auto",
            lineHeight: "1.6"
          }}>
            Select the perfect plan to grow your business and reach more customers
          </p>
        </div>
        
        {/* Plans Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "30px",
          marginBottom: "50px"
        }}>
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              style={{
                border: selectedPlan?.id === plan.id ? "3px solid #3b82f6" : "2px solid #e2e8f0",
                borderRadius: "20px",
                padding: "32px 24px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: selectedPlan?.id === plan.id ? "#dbeafe" : "#ffffff",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: selectedPlan?.id === plan.id ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                if (selectedPlan?.id !== plan.id) {
                  e.target.style.transform = "translateY(-4px) scale(1.01)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPlan?.id !== plan.id) {
                  e.target.style.transform = "translateY(0) scale(1)";
                }
              }}
            >
              {/* Popular Badge for 6 month plan */}
              {index === 2 && (
                <div style={{
                  position: "absolute",
                  top: "-1px",
                  right: "-1px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "0 20px 0 20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Recommended
                </div>
              )}
              
              {/* Plan Icon */}
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: selectedPlan?.id === plan.id ? "#3b82f6" : "#e2e8f0",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                transition: "all 0.3s ease"
              }}>
                {plan.id === 1 ? "🆓" : plan.id === 2 ? "📊" : plan.id === 3 ? "🚀" : "👑"}
              </div>

              <h3 style={{ 
                color: "#1e293b", 
                marginBottom: "8px", 
                fontSize: "1.5rem",
                fontWeight: "600"
              }}>
                {plan.name}
              </h3>
              
              <p style={{ 
                color: "#64748b", 
                marginBottom: "20px", 
                fontSize: "1rem",
                fontWeight: "500"
              }}>
                {plan.duration}
              </p>
              
              <div style={{ 
                fontSize: "2.5rem", 
                fontWeight: "800", 
                color: selectedPlan?.id === plan.id ? "#3b82f6" : "#1e293b", 
                marginBottom: "20px",
                lineHeight: "1",
                background: "transparent"
              }}>
                {plan.price}
              </div>

              {plan.id !== 1 && (
                <div style={{
                  fontSize: "0.9rem",
                  color: "#64748b",
                  marginBottom: "20px"
                }}>
                  per month: ₹{Math.round(parseInt(plan.price.replace('₹', '')) / (plan.id === 2 ? 3 : plan.id === 3 ? 6 : 16))}
                </div>
              )}
              
              {selectedPlan?.id === plan.id && (
                <div style={{ 
                  backgroundColor: "#3b82f6",
                  color: "white", 
                  padding: "8px 16px", 
                  borderRadius: "25px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginTop: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  ✓ SELECTED
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start Button */}
        {selectedPlan && (
          <div style={{ 
            textAlign: "center", 
            marginTop: "40px",
            animation: "fadeInUp 0.5s ease-out"
          }}>
            <button
              onClick={handleStartPlan}
              disabled={isCheckingTrial}
              style={{
                backgroundColor: isCheckingTrial ? "#94a3b8" : "#3b82f6",
                color: "white",
                border: "none",
                padding: "18px 48px",
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: "50px",
                cursor: isCheckingTrial ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                position: "relative",
                overflow: "hidden",
                opacity: isCheckingTrial ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isCheckingTrial) {
                  e.target.style.transform = "translateY(-2px) scale(1.05)";
                  e.target.style.backgroundColor = "#1d4ed8";
                }
              }}
              onMouseOut={(e) => {
                if (!isCheckingTrial) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {isCheckingTrial ? "⏳ Checking Eligibility..." : `🚀 Start ${selectedPlan.name}`}
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "24px",
              textAlign: "center",
              maxWidth: "480px",
              width: "90%",
              border: "1px solid #e2e8f0",
              position: "relative",
              animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
              {/* Success Icon */}
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>
                🎯
              </div>

              <h3 style={{ 
                marginBottom: "16px", 
                color: "#1e293b",
                fontSize: "1.8rem",
                fontWeight: "700"
              }}>
                Confirm Your Plan
              </h3>
              
              <p style={{ 
                marginBottom: "32px", 
                color: "#64748b",
                fontSize: "1.1rem",
                lineHeight: "1.6"
              }}>
                You're about to start the <strong style={{ color: "#3b82f6" }}>{selectedPlan?.name}</strong> for <strong style={{ color: "#059669" }}>{selectedPlan?.price}</strong>
              </p>

              {/* Plan Details Card */}
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "32px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "600", 
                  color: "#1e293b",
                  marginBottom: "8px"
                }}>
                  {selectedPlan?.name}
                </div>
                <div style={{ 
                  fontSize: "0.9rem", 
                  color: "#64748b"
                }}>
                  Duration: {selectedPlan?.duration}
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                gap: "16px", 
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => handleConfirmation(true)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? "#94a3b8" : "#10b981",
                    color: "white",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: "50px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.backgroundColor = "#059669";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.backgroundColor = "#10b981";
                    }
                  }}
                >
                  {isLoading ? "⏳ Processing..." : "✓ Yes, Start Plan"}
                </button>
                <button
                  onClick={() => handleConfirmation(false)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? "#94a3b8" : "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: "50px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.backgroundColor = "#dc2626";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.backgroundColor = "#ef4444";
                    }
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Dialog */}
        {showQRDialog && bankDetails && (
          <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: window.innerWidth <= 768 ? "flex-start" : "center", // Changed for mobile
            zIndex: "1000",
            animation: "fadeIn 0.3s ease-out",
            overflowY: window.innerWidth <= 768 ? "auto" : "hidden", // Scroll bar only for mobile view
            padding: window.innerWidth <= 768 ? "20px 0" : "0" // Add padding for mobile
          }}>
            <div style={{
              backgroundColor: "white",
              padding: window.innerWidth <= 768 ? "20px" : "25px", // Reduced padding for mobile
              borderRadius: "16px",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #e2e8f0",
              position: "relative",
              animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              maxHeight: window.innerWidth <= 768 ? "calc(95vh - 40px)" : "none", // Better height calculation for mobile
              marginTop: window.innerWidth <= 768 ? "10px" : "0", // Add top margin for mobile
              marginBottom: window.innerWidth <= 768 ? "20px" : "0", // Add bottom margin for mobile
              overflowY: window.innerWidth <= 768 ? "auto" : "visible" // Allow scrolling within modal on mobile
            }}>
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}>
                <h2 style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "1.3rem",
                  fontWeight: "700"
                }}>
                  💳 Payment QR Code
                </h2>
                <button
                  onClick={() => {
                    setShowQRDialog(false);
                    setSelectedPlan(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#64748b"
                  }}
                >
                  ×
                </button>
              </div>

              {/* Plan Summary */}
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                  {selectedPlan?.name}
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                  Amount: <strong style={{ color: "#10b981", fontSize: "1.2rem" }}>{selectedPlan?.price}</strong>
                </p>
              </div>

              {/* QR Code Display */}
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#1e293b", fontSize: "1rem" }}>
                  Scan QR Code to Pay
                </h4>
                <div style={{
                  display: "inline-block",
                  padding: "12px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0"
                }}>
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Payment QR Code"
                      style={{
                        width: "150px",
                        height: "150px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#64748b"
                    }}>
                      {isLoadingBankDetails ? "Generating QR..." : "QR Code not available"}
                    </div>
                  )}
                </div>
                <p style={{ 
                  margin: "15px 0 0 0", 
                  color: "#64748b", 
                  fontSize: "12px",
                  lineHeight: "1.4"
                }}>
                  Scan with any UPI app like Google Pay, PhonePe, or Paytm<br />
                  After payment, click "Next" to enter transaction details
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={handleQRNext}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? "#94a3b8" : "#10b981",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "25px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.backgroundColor = "#059669";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.backgroundColor = "#10b981";
                    }
                  }}
                >
                  {isLoading ? "⏳ Processing..." : "Next →"}
                </button>
                <button
                  onClick={() => {
                    setShowQRDialog(false);
                    setSelectedPlan(null);
                  }}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? "#94a3b8" : "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: "50px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && bankDetails && (
          <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid #e2e8f0",
              position: "relative",
              animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px"
              }}>
                <h2 style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "1.3rem",
                  fontWeight: "700"
                }}>
                  📝 Submit Transaction Details
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    setTransactionId('');
                    setPaymentScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#64748b"
                  }}
                >
                  ×
                </button>
              </div>

              {/* Plan Summary */}
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                  Payment for: {selectedPlan?.name}
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                  Amount Paid: <strong style={{ color: "#10b981", fontSize: "1.1rem" }}>{selectedPlan?.price}</strong>
                </p>
              </div>

              {/* Payment Confirmation Message */}
              <div style={{
                backgroundColor: "rgba(254, 255, 198, 1)",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "25px",
                border: "1px solid #e7f253ff"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px"
                }}>
                  <span style={{ fontSize: "24px", marginRight: "10px" }}>⏳</span>
                  <h4 style={{ margin: 0, color: "#5f5c06ff" }}>Payment Inprogress...</h4>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: "#707804ff", 
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  Please enter your transaction ID below to complete the verification process.
                </p>
                {subscriptionId && (
                  <p style={{ 
                    margin: "10px 0 0 0", 
                    color: "#047857", 
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    Subscription ID: {subscriptionId}
                  </p>
                )}
              </div>

              {/* Transaction ID Input */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1e293b",
                  fontSize: "13px",
                  fontWeight: "600"
                }}>
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "11px",
                  color: "#64748b"
                }}>
                  Enter the transaction ID from your payment app or bank
                </p>
              </div>

              {/* Payment Screenshot Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1e293b",
                  fontSize: "13px",
                  fontWeight: "600"
                }}>
                  Payment Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    backgroundColor: "#f8fafc"
                  }}
                />
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "11px",
                  color: "#64748b"
                }}>
                  Upload a screenshot of your payment confirmation (PNG, JPG, JPEG)
                </p>
                
                {/* Screenshot Preview */}
                {screenshotPreview && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor: "#f8fafc"
                  }}>
                    <p style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      color: "#1e293b",
                      fontWeight: "600"
                    }}>
                      Preview:
                    </p>
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentScreenshot(null);
                        setScreenshotPreview(null);
                      }}
                      style={{
                        marginTop: "8px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={submitPayment}
                  disabled={isSubmittingPayment || !transactionId.trim()}
                  style={{
                    backgroundColor: isSubmittingPayment || !transactionId.trim() ? "#94a3b8" : "#10b981",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "25px",
                    cursor: isSubmittingPayment || !transactionId.trim() ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    opacity: isSubmittingPayment || !transactionId.trim() ? 0.7 : 1
                  }}
                >
                  {isSubmittingPayment ? "⏳ Submitting..." : "✓ Submit Payment"}
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    setTransactionId('');
                    setPaymentScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                  disabled={isSubmittingPayment}
                  style={{
                    backgroundColor: isSubmittingPayment ? "#94a3b8" : "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "25px",
                    cursor: isSubmittingPayment ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    opacity: isSubmittingPayment ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <MainFooter />
      <TermFooter />
    </div>
  );
};

export default DealerMarketplace;

