import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

// component
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";
import LoadingSpinner from "../../LoadingSpinner";

// CSS
import "../../../Css/DealerBill.css";

// utils
import { USER_API_ENDPOINTS, apiUrl1 } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";

// icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';

const BillPage = () => {
    const [loading, setLoading] = useState(true);
    const [billData, setBillData] = useState(null);
    const [error, setError] = useState(null);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentCommissionForPayment, setCurrentCommissionForPayment] = useState(null);
    
    // Order details pagination state for each bill
    const [billPagination, setBillPagination] = useState({});
    const [ordersPerPage] = useState(7);

    useEffect(() => {
        fetchBillData();
    }, []);

    const fetchBillData = async () => {
        try {
            setLoading(true);
            const authData = JSON.parse(localStorage.getItem("KTMauth"));
            const dealerId = authData?.dealer_id;

            if (!dealerId) {
                throw new Error("Dealer ID not found");
            }

            const accessToken = await getAccessTokenFromRefresh();
            
            const response = await axios.get(
                `${USER_API_ENDPOINTS.GET_COMMISSION_ID_FOR_DEALER}${dealerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setBillData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching bill data:", err);
            setError(err.message || "Failed to fetch bill data");
            toast.error("Failed to fetch bill data");
        } finally {
            setLoading(false);
        }
    };

    const handleViewBill = async (commissionId) => {
        try {
            const accessToken = await getAccessTokenFromRefresh();
            const billUrl = `${USER_API_ENDPOINTS.COMMISSION_BILL_OF_DEALER}${commissionId}/`;
            
            // Open in new tab
            window.open(`${billUrl}?access_token=${accessToken}`, '_blank');
        } catch (err) {
            console.error("Error viewing bill:", err);
            toast.error("Failed to open bill");
        }
    };

    const handleDownloadBill = async (commissionId) => {
        try {
            const accessToken = await getAccessTokenFromRefresh();
            
            const response = await axios.get(
                `${USER_API_ENDPOINTS.COMMISSION_BILL_OF_DEALER}${commissionId}/?download=pdf`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    responseType: 'blob',
                }
            );

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `commission_bill_${commissionId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Bill downloaded successfully");
        } catch (err) {
            console.error("Error downloading bill:", err);
            toast.error("Failed to download bill");
        }
    };

    // Generate QR Code for payment - exactly like DealerMarketplace
    const generateQRCode = async (upiUrl) => {
        try {
            // First generate the QR code
            const qrDataUrl = await QRCode.toDataURL(upiUrl, {
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
    };

    // Handle Pay Commission click for individual commission
    const handlePayCommission = async (commission) => {
        // Check if payment is allowed based on due date for this specific commission
        if (!isPaymentAllowedForCommission(commission)) {
            const dueDate = getExtendedDueDate(commission.payment_due_date);
            toast.error(`Payment window has closed for this commission. Deadline was ${formatDate(dueDate)}.`);
            return;
        }

        // Check if this commission is unpaid and has no payment transaction
        if (commission.status === 'Paid' || commission.payment_transaction) {
            toast.error("This commission is already paid or has a pending payment");
            return;
        }

        // Set current commission for payment
        setCurrentCommissionForPayment(commission);

        if (commission.payment_qr_url) {
            await generateQRCode(commission.payment_qr_url);
            setShowQRDialog(true);
        } else {
            toast.error("Payment QR URL not available for this commission");
        }
    };

    // Handle screenshot upload - exactly like DealerMarketplace
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

    // Handle QR Next button - exactly like DealerMarketplace
    const handleQRNext = async () => {
        setIsLoading(true);
        setShowQRDialog(false);
        setShowPaymentModal(true);
        setIsLoading(false);
    };

    // Submit payment proof for individual commission
    const submitPayment = async () => {
        if (!transactionId.trim()) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please enter a transaction ID',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (!currentCommissionForPayment) {
            toast.error("No commission selected for payment");
            setIsSubmittingPayment(false);
            return;
        }

        setIsSubmittingPayment(true);
        try {
            const accessToken = await getAccessTokenFromRefresh();
            
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('commission', currentCommissionForPayment.id);
            formData.append('transaction_id', transactionId);
            formData.append('amount', currentCommissionForPayment.commission_amount);
            formData.append('payment_method', 'qr_code');
            formData.append('payment_screenshot', paymentScreenshot);         
            
            const response = await axios.post(
                USER_API_ENDPOINTS.COMMISSION_PAYMENT_DETAILS,
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
                    <p style="margin-bottom: 15px; color: #10b981; font-weight: 600;">Payment details submitted successfully. Awaiting admin verification.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 15px;">
                      <h4 style="margin: 0 0 10px 0; color: #1e293b;">Payment Transaction Details:</h4>
                      <p style="margin: 5px 0;"><strong>Commission ID:</strong> ${currentCommissionForPayment.id}</p>
                      <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                      <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${currentCommissionForPayment.commission_amount}</p>
                      <p style="margin: 5px 0;"><strong>Payment Method:</strong> qr_code</p>
                      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">pending_verification</span></p>
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
                setTransactionId('');
                setPaymentScreenshot(null);
                setScreenshotPreview(null);
                setCurrentCommissionForPayment(null);
                
                // Refresh bill data
                fetchBillData();
            });

        } catch (error) {
            console.error('Error submitting payment proof:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to submit payment proof. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return '#4CAF50';
            case 'unpaid':
                return '#FF5722';
            case 'overdue':
                return '#F44336';
            case 'confirmed':
                return '#22c55e';
            case 'completed':
                return '#3b82f6';
            case 'pending':
                return '#ed8936';
            case 'cancelled':
                return '#e53e3e';
            default:
                return '#757575';
        }
    };

    // Helper function to get actual unpaid amount (excluding commissions with payment transactions)
    const getActualUnpaidAmount = () => {
        if (!billData?.commissions) return 0;
        
        return billData.commissions
            .filter(commission => commission.status !== 'Paid' && !commission.payment_transaction)
            .reduce((total, commission) => total + parseFloat(commission.commission_amount), 0);
    };

    // Helper function to get extended due date (original + 7 days)
    const getExtendedDueDate = (originalDueDate) => {
        if (!originalDueDate) return null;
        const date = new Date(originalDueDate);
        date.setDate(date.getDate() + 7);
        return date;
    };

    // Helper function to get the earliest payment due date from unpaid commissions
    // Note: Payments are allowed for 7 days after the original payment_due_date
    const getEarliestPaymentDueDate = () => {
        if (!billData?.commissions) return null;
        
        const unpaidCommissions = billData.commissions
            .filter(commission => commission.status !== 'Paid' && !commission.payment_transaction && commission.payment_due_date);
        
        if (unpaidCommissions.length === 0) return null;
        
        const earliestOriginalDate = unpaidCommissions.reduce((earliest, commission) => {
            const currentDate = new Date(commission.payment_due_date);
            return currentDate < earliest ? currentDate : earliest;
        }, new Date(unpaidCommissions[0].payment_due_date));
        
        // Add 7 days to the original payment due date
        return getExtendedDueDate(earliestOriginalDate);
    };

    // Helper function to check if payment is allowed for a specific commission (within 7 days after payment due date)
    const isPaymentAllowedForCommission = (commission) => {
        if (!commission || !commission.payment_due_date) return false;
        
        // If already paid or has payment transaction, no payment allowed
        if (commission.status === 'Paid' || commission.payment_transaction) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        const originalDueDate = new Date(commission.payment_due_date);
        originalDueDate.setHours(0, 0, 0, 0);
        
        const extendedDueDate = getExtendedDueDate(commission.payment_due_date);
        extendedDueDate.setHours(0, 0, 0, 0);
        
        // Payment is allowed only between original due date and extended due date (7 days window)
        return today >= originalDueDate && today <= extendedDueDate;
    };

    // Helper function to get payment due date message for a specific commission
    const getPaymentDueDateMessageForCommission = (commission) => {
        if (!commission || !commission.payment_due_date) return "Payment due date not available";
        
        // If already paid or has payment transaction
        if (commission.status === 'Paid' || commission.payment_transaction) {
            return "Payment completed";
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const originalDueDate = new Date(commission.payment_due_date);
        originalDueDate.setHours(0, 0, 0, 0);
        
        const extendedDueDate = getExtendedDueDate(commission.payment_due_date);
        extendedDueDate.setHours(0, 0, 0, 0);
        
        if (today < originalDueDate) {
            const diffTime = originalDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `Payment opens on ${formatDate(originalDueDate)} (${diffDays} day${diffDays > 1 ? 's' : ''} remaining)`;
        } else if (today >= originalDueDate && today <= extendedDueDate) {
            const diffTime = extendedDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                return `Payment window closes today (${formatDate(extendedDueDate)})`;
            } else {
                return `Payment window closes in ${diffDays} day${diffDays > 1 ? 's' : ''} (${formatDate(extendedDueDate)})`;
            }
        } else {
            return `Payment window closed (Closed on: ${formatDate(extendedDueDate)})`;
        }
    };

    // Helper function to check if payment is allowed (within 7 days after payment due date)
    // Payments are allowed ONLY from the original payment_due_date until 7 days after
    const isPaymentAllowed = () => {
        if (!billData?.commissions) return false;
        
        const unpaidCommissions = billData.commissions
            .filter(commission => commission.status !== 'Paid' && !commission.payment_transaction && commission.payment_due_date);
        
        if (unpaidCommissions.length === 0) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        // Get the earliest original payment due date
        const earliestOriginalDate = unpaidCommissions.reduce((earliest, commission) => {
            const currentDate = new Date(commission.payment_due_date);
            return currentDate < earliest ? currentDate : earliest;
        }, new Date(unpaidCommissions[0].payment_due_date));
        
        const originalDueDate = new Date(earliestOriginalDate);
        originalDueDate.setHours(0, 0, 0, 0);
        
        const extendedDueDate = getExtendedDueDate(earliestOriginalDate);
        extendedDueDate.setHours(0, 0, 0, 0);
        
        // Payment is allowed only between original due date and extended due date (7 days window)
        return today >= originalDueDate && today <= extendedDueDate;
    };

    // Helper function to format payment due date message
    const getPaymentDueDateMessage = () => {
        if (!billData?.commissions) return "Payment due date not available";
        
        const unpaidCommissions = billData.commissions
            .filter(commission => commission.status !== 'Paid' && !commission.payment_transaction && commission.payment_due_date);
        
        if (unpaidCommissions.length === 0) return "No unpaid commissions";
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get the earliest original payment due date
        const earliestOriginalDate = unpaidCommissions.reduce((earliest, commission) => {
            const currentDate = new Date(commission.payment_due_date);
            return currentDate < earliest ? currentDate : earliest;
        }, new Date(unpaidCommissions[0].payment_due_date));
        
        const originalDueDate = new Date(earliestOriginalDate);
        originalDueDate.setHours(0, 0, 0, 0);
        
        const extendedDueDate = getExtendedDueDate(earliestOriginalDate);
        extendedDueDate.setHours(0, 0, 0, 0);
        
        if (today < originalDueDate) {
            const diffTime = originalDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `Payment window opens on ${formatDate(originalDueDate)} (${diffDays} day${diffDays > 1 ? 's' : ''} remaining)`;
        } else if (today >= originalDueDate && today <= extendedDueDate) {
            const diffTime = extendedDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                return `Payment window closes today (${formatDate(extendedDueDate)})`;
            } else {
                return `Payment window closes in ${diffDays} day${diffDays > 1 ? 's' : ''} (${formatDate(extendedDueDate)})`;
            }
        } else {
            return `Payment window has closed (Closed on: ${formatDate(extendedDueDate)})`;
        }
    };

    // Helper function to get items summary for an order
    const getItemsSummary = (items) => {
        if (!items || items.length === 0) return "No items";
        
        return items.map(item => 
            `${item.subcategory_name} (${item.quantity} ${item.unit})`
        ).join(", ");
    };

    // Helper function to get current page for a specific bill
    const getCurrentPage = (billId) => {
        return billPagination[billId]?.currentPage || 1;
    };

    // Helper function to set current page for a specific bill
    const setCurrentPage = (billId, page) => {
        setBillPagination(prev => ({
            ...prev,
            [billId]: {
                ...prev[billId],
                currentPage: page
            }
        }));
    };

    // Helper function to get paginated orders for a specific bill
    const getPaginatedOrders = (commission) => {
        if (!commission.order_details || commission.order_details.length === 0) {
            return {
                currentOrders: [],
                totalPages: 0,
                totalOrders: 0,
                currentPage: 1
            };
        }

        // Sort orders by date in reverse order (newest first)
        const sortedOrders = [...commission.order_details].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        const currentPage = getCurrentPage(commission.id);
        const totalOrders = sortedOrders.length;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);
        const indexOfLastOrder = currentPage * ordersPerPage;
        const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
        const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

        return {
            currentOrders,
            totalPages,
            totalOrders,
            currentPage,
            indexOfFirstOrder,
            indexOfLastOrder
        };
    };

    // Pagination handlers for individual bills
    const handlePageChange = (billId, pageNumber) => {
        setCurrentPage(billId, pageNumber);
    };

    const handlePreviousPage = (billId) => {
        const currentPage = getCurrentPage(billId);
        if (currentPage > 1) {
            setCurrentPage(billId, currentPage - 1);
        }
    };

    const handleNextPage = (billId) => {
        const currentPage = getCurrentPage(billId);
        const { totalPages } = getPaginatedOrders(billData.commissions.find(c => c.id === billId));
        if (currentPage < totalPages) {
            setCurrentPage(billId, currentPage + 1);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <DealerProfileSearchbar />
                <DealerProfileNavbar />
                <LoadingSpinner />
                <MainFooter />
                <TermFooter />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <DealerProfileSearchbar />
            <DealerProfileNavbar />
            <div className="bill-page-container">
                <div className="bill-header">
                    <h1 className="bill-title">Commission Bills</h1>
                    <p className="bill-subtitle">Manage your commission bills and payments</p>
                </div>

                {error ? (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchBillData} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : billData ? (
                    <>
                        {/* Dealer Info */}
                        <div className="dealer-info-card">
                            <h2>Dealer Information</h2>
                            <div className="dealer-details">
                                <p><strong>Name:</strong> {billData.dealer.name}</p>
                                <p><strong>KT ID:</strong> {billData.dealer.kt_id}</p>
                                <p><strong>Status: </strong> 
                                    <span className={`status ${billData.dealer.is_active ? 'active' : 'inactive'}`}>
                                        {billData.dealer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="summary-icon">
                                    <AttachMoneyIcon />
                                </div>
                                <div className="summary-content">
                                    <h3>Total Commission</h3>
                                    <p className="summary-amount">{formatCurrency(billData.summary.total_commission_amount)}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon paid">
                                    <AttachMoneyIcon />
                                </div>
                                <div className="summary-content">
                                    <h3>Paid Amount</h3>
                                    <p className="summary-amount">{formatCurrency(billData.summary.total_paid_amount)}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon unpaid">
                                    <AttachMoneyIcon />
                                </div>
                                <div className="summary-content">
                                    <h3>Unpaid Amount</h3>
                                    <p className="summary-amount">{formatCurrency(billData.summary.total_unpaid_amount)}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon">
                                    <CalendarTodayIcon />
                                </div>
                                <div className="summary-content">
                                    <h3>Total Bills</h3>
                                    <p className="summary-count">{billData.summary.total_commissions}</p>
                                </div>
                            </div>
                        </div>

                        {/* Commission Bills */}
                        <div className="bills-section">
                            <h2>Commission Bills</h2>
                            {billData.commissions && billData.commissions.length > 0 ? (
                                <div className="bills-grid">
                                    {billData.commissions.map((commission) => (
                                        <div key={commission.id} className="bill-card">
                                            <div className="bill-card-header">
                                                <h3>Bill #{commission.id}</h3>
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(commission.status) }}
                                                >
                                                    {commission.status}
                                                </span>
                                            </div>
                                            <div className="bill-card-content">
                                                <div className="bill-detail">
                                                    <strong>Commission Amount:</strong>
                                                    <span className="amount">{formatCurrency(commission.commission_amount)}</span>
                                                </div>
                                                <div className="bill-detail">
                                                    <strong>Total Order Amount:</strong>
                                                    <span>{formatCurrency(commission.total_order_amount)}</span>
                                                </div>
                                                <div className="bill-detail">
                                                    <strong>Payment Cycle:</strong>
                                                    <span>{formatDate(commission.calculation_date)} to {formatDate(commission.payment_due_date)}</span>
                                                </div>
                                                <div className="bill-detail">
                                                    <strong>Payment Due Date:</strong>
                                                    <span>{formatDate(getExtendedDueDate(commission.payment_due_date))}</span>
                                                </div>
                                                
                                                {/* Order Details Table */}
                                                <div className="bill-order-details">
                                                    <strong className="order-details-title">Order Details:</strong>
                                                    {commission.order_details && commission.order_details.length > 0 ? (
                                                        (() => {
                                                            const paginationData = getPaginatedOrders(commission);
                                                            const { currentOrders, totalPages, totalOrders, currentPage, indexOfFirstOrder, indexOfLastOrder } = paginationData;
                                                            
                                                            return (
                                                                <div className="bill-order-table-container">
                                                                    <div className="bill-table-responsive">
                                                                        <table className="bill-order-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Order No</th>
                                                                                    <th>Pickup Date</th>
                                                                                    <th>Items</th>
                                                                                    <th>Price</th>
                                                                                    <th>Commission</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {currentOrders.map((order, index) => (
                                                                                    <tr key={`${order.order_number}-${index}`}>
                                                                                        <td className="bill-order-number">
                                                                                            <strong>{order.order_number}</strong>
                                                                                        </td>
                                                                                        <td className="bill-order-date">
                                                                                            <div className="bill-date-info">
                                                                                                <strong>
                                                                                                    {order.pickup_date ? formatDate(order.pickup_date) : formatDate(order.date)}
                                                                                                </strong>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="bill-order-items">
                                                                                            <div className="bill-items-summary">
                                                                                                {getItemsSummary(order.items)}
                                                                                            </div>
                                                                                            {order.items && order.items.length > 0 && (
                                                                                                <small className="bill-items-count">
                                                                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                                                                </small>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="bill-order-price">
                                                                                            <strong className="bill-order-total">
                                                                                                {formatCurrency(order.order_total)}
                                                                                            </strong>
                                                                                        </td>
                                                                                        <td className="bill-commission-amount">
                                                                                            <strong className="bill-commission-value">
                                                                                                {formatCurrency(order.commission_amount)}
                                                                                            </strong>
                                                                                        </td>
                                                                                        <td className="bill-order-status">
                                                                                            <span 
                                                                                                className={`bill-order-status-badge ${order.status.toLowerCase()}`}
                                                                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                                                                            >
                                                                                                {order.status}
                                                                                            </span>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    {/* Pagination for this bill */}
                                                                    {totalPages > 1 && (
                                                                        <div className="bill-pagination-container">
                                                                            <div className="bill-pagination-info">
                                                                                <span>
                                                                                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, totalOrders)} of {totalOrders} orders
                                                                                </span>
                                                                            </div>
                                                                            <div className="bill-pagination-controls">
                                                                                <button 
                                                                                    className="bill-pagination-btn"
                                                                                    onClick={() => handlePreviousPage(commission.id)}
                                                                                    disabled={currentPage === 1}
                                                                                >
                                                                                    Previous
                                                                                </button>
                                                                                
                                                                                <div className="bill-pagination-numbers">
                                                                                    {[...Array(totalPages)].map((_, index) => {
                                                                                        const pageNumber = index + 1;
                                                                                        const isActive = pageNumber === currentPage;
                                                                                        const showPage = 
                                                                                            pageNumber === 1 || 
                                                                                            pageNumber === totalPages || 
                                                                                            Math.abs(pageNumber - currentPage) <= 1;
                                                                                        
                                                                                        if (!showPage) {
                                                                                            if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                                                                                return <span key={pageNumber} className="bill-pagination-ellipsis">...</span>;
                                                                                            }
                                                                                            return null;
                                                                                        }
                                                                                        
                                                                                        return (
                                                                                            <button
                                                                                                key={pageNumber}
                                                                                                className={`bill-pagination-number ${isActive ? 'active' : ''}`}
                                                                                                onClick={() => handlePageChange(commission.id, pageNumber)}
                                                                                            >
                                                                                                {pageNumber}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                                
                                                                                <button 
                                                                                    className="bill-pagination-btn"
                                                                                    onClick={() => handleNextPage(commission.id)}
                                                                                    disabled={currentPage === totalPages}
                                                                                >
                                                                                    Next
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Order Summary for this bill */}
                                                                    <div className="bill-order-summary">
                                                                        <div className="bill-summary-grid">
                                                                            <div className="bill-summary-item">
                                                                                <span className="bill-summary-label">Total Orders:</span>
                                                                                <span className="bill-summary-value">{totalOrders}</span>
                                                                            </div>
                                                                            <div className="bill-summary-item">
                                                                                <span className="bill-summary-label">Total Value:</span>
                                                                                <span className="bill-summary-value">
                                                                                    {formatCurrency(commission.order_details.reduce((sum, order) => sum + (order.order_total || 0), 0))}
                                                                                </span>
                                                                            </div>
                                                                            <div className="bill-summary-item">
                                                                                <span className="bill-summary-label">Total Commission:</span>
                                                                                <span className="bill-summary-value">
                                                                                    {formatCurrency(commission.order_details.reduce((sum, order) => sum + (order.commission_amount || 0), 0))}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <div className="no-orders-message">
                                                            <p>No order details available for this bill.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Payment Transaction Details */}
                                                {commission.payment_transaction && (
                                                    <div className="payment-transaction-section">
                                                        <hr className="transaction-divider" />
                                                        <h4 className="transaction-title">Payment Transaction Details</h4>
                                                        <div className="transaction-details">
                                                            <div className="bill-detail">
                                                                <strong>Transaction ID:</strong>
                                                                <span className="transaction-id">{commission.payment_transaction.transaction_id}</span>
                                                            </div>
                                                            <div className="bill-detail">
                                                                <strong>Payment Amount:</strong>
                                                                <span className="amount">{formatCurrency(commission.payment_transaction.amount)}</span>
                                                            </div>
                                                            <div className="bill-detail">
                                                                <strong>Payment Method:</strong>
                                                                <span className="payment-method">{commission.payment_transaction.payment_method}</span>
                                                            </div>
                                                            <div className="bill-detail">
                                                                <strong>Payment Date:</strong>
                                                                <span>{formatDate(commission.payment_transaction.created_at)}</span>
                                                            </div>
                                                            <div className="bill-detail">
                                                                <strong>Payment Status:</strong>
                                                                <span 
                                                                    className={`payment-status ${commission.payment_transaction.status}`}
                                                                    style={{ 
                                                                        color: commission.payment_transaction.status === 'verified' ? '#4CAF50' : '#FF9800',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    {commission.payment_transaction.status === 'verified' ? 'Verified' : 'Pending Verification'}
                                                                </span>
                                                            </div>
                                                            {commission.payment_transaction.payment_screenshot && (
                                                                <div className="bill-detail">
                                                                    <strong>Payment Screenshot:</strong>
                                                                    <button 
                                                                        className="screenshot-button"
                                                                        onClick={() => window.open(`${apiUrl1}${commission.payment_transaction.payment_screenshot}`, '_blank')}
                                                                    >
                                                                        View Screenshot
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bill-card-actions">
                                                <button 
                                                    onClick={() => handleViewBill(commission.id)}
                                                    className="action-button view-button"
                                                >
                                                    <VisibilityIcon /> View Bill
                                                </button>
                                                <button 
                                                    onClick={() => handleDownloadBill(commission.id)}
                                                    className="action-button download-button"
                                                >
                                                    <DownloadIcon /> Download PDF
                                                </button>
                                                
                                                {/* Individual Payment Button or Payment Status */}
                                                {commission.status !== 'Paid' && !commission.payment_transaction && commission.payment_qr_url ? (
                                                    <div className="payment-button-container">
                                                        <button 
                                                            onClick={() => handlePayCommission(commission)}
                                                            className={`action-button payment-button ${!isPaymentAllowedForCommission(commission) ? 'disabled' : ''}`}
                                                            disabled={!isPaymentAllowedForCommission(commission)}
                                                            title={getPaymentDueDateMessageForCommission(commission)}
                                                        >
                                                            <PaymentIcon /> 
                                                            {isPaymentAllowedForCommission(commission) ? 
                                                                `Pay ${formatCurrency(commission.commission_amount)}` : 
                                                                'Payment Window Closed'
                                                            }
                                                        </button>
                                                        <small className="payment-info-text">
                                                            {getPaymentDueDateMessageForCommission(commission)}
                                                        </small>
                                                    </div>
                                                ) : commission.status === 'Paid' || commission.payment_transaction ? (
                                                    <div className="payment-button-container">
                                                        <button 
                                                            className={`action-button ${commission.status === 'Paid' ? 'payment-completed-button' : 'payment-pending-button'}`}
                                                            disabled={true}
                                                            title={commission.status === 'Paid' ? 
                                                                'Payment completed and verified' : 
                                                                'Payment submitted, awaiting verification'
                                                            }
                                                        >
                                                            {commission.status === 'Paid' ? (
                                                                <>
                                                                    <span style={{ fontSize: '16px' }}>✓</span>
                                                                    Payment Completed
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontSize: '16px' }}>⏳</span>
                                                                    Payment Pending
                                                                </>
                                                            )}
                                                        </button>
                                                        <small className="payment-info-text">
                                                            {commission.status === 'Paid' ? 
                                                                `Paid: ${formatCurrency(commission.commission_amount)}` :
                                                                'Awaiting admin verification'
                                                            }
                                                        </small>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-bills-message">
                                    <PictureAsPdfIcon className="no-bills-icon" />
                                    <h3>No Bills Found</h3>
                                    <p>You don't have any commission bills yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="no-data-message">
                        <p>No bill data available</p>
                    </div>
                )}
            </div>

            {/* QR Code Payment Dialog - Exactly like DealerMarketplace */}
            {showQRDialog && (
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
                    alignItems: window.innerWidth <= 768 ? "flex-start" : "center",
                    zIndex: "1000",
                    animation: "fadeIn 0.3s ease-out",
                    overflowY: window.innerWidth <= 768 ? "auto" : "hidden",
                    padding: window.innerWidth <= 768 ? "20px 0" : "0"
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: window.innerWidth <= 768 ? "20px" : "25px",
                        borderRadius: "16px",
                        textAlign: "center",
                        maxWidth: "400px",
                        width: "90%",
                        border: "1px solid #e2e8f0",
                        position: "relative",
                        animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        maxHeight: window.innerWidth <= 768 ? "calc(95vh - 40px)" : "none",
                        marginTop: window.innerWidth <= 768 ? "10px" : "0",
                        marginBottom: window.innerWidth <= 768 ? "20px" : "0",
                        overflowY: window.innerWidth <= 768 ? "auto" : "visible"
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
                                    setCurrentCommissionForPayment(null);
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

                        {/* Commission Summary */}
                        <div style={{
                            backgroundColor: "#f8fafc",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                                Commission Payment - Bill #{currentCommissionForPayment?.id}
                            </h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                                Amount: <strong style={{ color: "#10b981", fontSize: "1.2rem" }}>{formatCurrency(currentCommissionForPayment?.commission_amount || 0)}</strong>
                            </p>
                            <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                                Due Date: {currentCommissionForPayment?.payment_due_date ? formatDate(currentCommissionForPayment.payment_due_date) : 'N/A'}
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
                                        Generating QR...
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
                                    setCurrentCommissionForPayment(null);
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

            {/* Submit Transaction Details Modal - Exactly like DealerMarketplace */}
            {showPaymentModal && (
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
                                    setTransactionId('');
                                    setPaymentScreenshot(null);
                                    setScreenshotPreview(null);
                                    setCurrentCommissionForPayment(null);
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

                        {/* Payment Summary */}
                        <div style={{
                            backgroundColor: "#f8fafc",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                                Payment for: Commission Bill #{currentCommissionForPayment?.id}
                            </h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                                Amount Paid: <strong style={{ color: "#10b981", fontSize: "1.1rem" }}>{formatCurrency(currentCommissionForPayment?.commission_amount || 0)}</strong>
                            </p>
                            <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                                Due Date: {currentCommissionForPayment?.payment_due_date ? formatDate(currentCommissionForPayment.payment_due_date) : 'N/A'}
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
                                Payment Screenshot
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
                                    setTransactionId('');
                                    setPaymentScreenshot(null);
                                    setScreenshotPreview(null);
                                    setCurrentCommissionForPayment(null);
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

            <MainFooter />
            <TermFooter />
        </>
    );
};

export default BillPage;
