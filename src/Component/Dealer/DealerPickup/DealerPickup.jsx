import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Components
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// Styles
import "../../../Css/UserDealerPickup.css";
import "../../../App.css";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

// ViewButton component to check pickup date and show view button accordingly
const ViewButton = ({ orderNumber, onView }) => {
  const [showView, setShowView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickupDate, setPickupDate] = useState(null);

  useEffect(() => {
    const checkPickupDate = async () => {
      try {
        const response = await axios.get(
          `${USER_API_ENDPOINTS.GET_ALL_ORDERS_OF_CUSTOMER_FOR_DEALER}${orderNumber}/`
        );
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const orderData = response.data[0];
          // The pickup_date is directly in the response, not nested under pickup object
          const pickupDate = orderData.pickup_date;
          
          console.log("=== ViewButton Debug for Order:", orderNumber, "===");
          console.log("Full API Response:", response.data[0]);
          console.log("Direct pickup_date:", orderData.pickup_date);
          console.log("Direct pickup_time:", orderData.pickup_time);
          console.log("Extracted pickup_date:", pickupDate);
          
          if (pickupDate) {
            const today = new Date();
            const pickup = new Date(pickupDate);
            
            // Console log the dates for debugging
            console.log("Current Date (today):", today);
            console.log("Current Date String:", today.toDateString());
            console.log("Current Date ISO:", today.toISOString().split('T')[0]);
            console.log("Pickup Date:", pickup);
            console.log("Pickup Date String:", pickup.toDateString());
            console.log("Pickup Date ISO:", pickup.toISOString().split('T')[0]);
            console.log("Raw pickup_date from API:", pickupDate);
            
            // Compare only the date part (year, month, day)
            const isToday = (
              today.getFullYear() === pickup.getFullYear() &&
              today.getMonth() === pickup.getMonth() &&
              today.getDate() === pickup.getDate()
            );
            
            console.log("Year comparison:", today.getFullYear(), "===", pickup.getFullYear(), "=>", today.getFullYear() === pickup.getFullYear());
            console.log("Month comparison:", today.getMonth(), "===", pickup.getMonth(), "=>", today.getMonth() === pickup.getMonth());
            console.log("Date comparison:", today.getDate(), "===", pickup.getDate(), "=>", today.getDate() === pickup.getDate());
            console.log("Final isToday result:", isToday);
            console.log("Setting showView to:", isToday);
            console.log("=====================================");
            
            setShowView(isToday);
            setPickupDate(pickupDate);
          } else {
            console.log("No pickup_date found in response for order:", orderNumber);
            setShowView(false);
            setPickupDate(null);
          }
        } else {
          console.log("Invalid or empty response for order:", orderNumber, response.data);
          setShowView(false);
        }
      } catch (error) {
        console.error("Error checking pickup date:", error);
        setShowView(false);
      } finally {
        setLoading(false);
      }
    };

    checkPickupDate();
  }, [orderNumber]);

  if (loading) {
    return (
      <button
        disabled
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          minWidth: '50px',
          cursor: 'not-allowed'
        }}
      >
        ...
      </button>
    );
  }

  if (!showView) {
    console.log("ViewButton rendering 'Details available on pickup date' for order:", orderNumber, "showView:", showView);
    // Format pickup date for display (DD/MM/YYYY) if available
    let displayText = 'Details available on pickup date';
    if (pickupDate) {
      try {
        const pd = new Date(pickupDate);
        if (!isNaN(pd)) {
          const formatted = pd.toLocaleDateString('en-GB'); // dd/mm/yyyy
          displayText = `Details available on ${formatted}`;
        }
      } catch (e) {
        // fallback to default text
      }
    }

    return (
      <span style={{ fontSize: '11px', color: '#6c757d' }}>
        {displayText}
      </span>
    );
  }

  console.log("ViewButton rendering View button for order:", orderNumber, "showView:", showView);
  return (
    <button
      onClick={() => onView(orderNumber)}
      style={{
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        minWidth: '50px'
      }}
    >
      View
    </button>
  );
};

// VerifyButton component to check pickup date and show verify/completed button accordingly
const VerifyButton = ({ orderNumber, status, onVerify }) => {
  const [showVerify, setShowVerify] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPickupDateForActions = async () => {
      if (!status.toLowerCase().includes('accepted')) {
        setShowVerify(false);
        setShowCompleted(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${USER_API_ENDPOINTS.GET_ALL_ORDERS_OF_CUSTOMER_FOR_DEALER}${orderNumber}/`
        );
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const orderData = response.data[0];
          const pickupDate = orderData.pickup_date;
          
          if (pickupDate) {
            const today = new Date();
            const pickup = new Date(pickupDate);
            
            // Set time to start of day for accurate comparison
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            const pickupStart = new Date(pickup);
            pickupStart.setHours(0, 0, 0, 0);
            
            const isToday = todayStart.getTime() === pickupStart.getTime();
            const isPast = pickupStart < todayStart;
            
            setShowVerify(isToday);
            setShowCompleted(isPast);
          } else {
            setShowVerify(false);
            setShowCompleted(false);
          }
        } else {
          setShowVerify(false);
          setShowCompleted(false);
        }
      } catch (error) {
        console.error("Error checking pickup date for verify/completed:", error);
        setShowVerify(false);
        setShowCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    checkPickupDateForActions();
  }, [orderNumber, status]);

  if (loading) {
    return (
      <button
        disabled
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          minWidth: '50px',
          cursor: 'not-allowed'
        }}
      >
        ...
      </button>
    );
  }

  if (showCompleted) {
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        backgroundColor: '#17a2b8',
        color: 'white',
        minWidth: '50px',
        display: 'inline-block',
        textAlign: 'center'
      }}>
        Completed
      </span>
    );
  }

  if (showVerify) {
    return (
      <button
        onClick={() => onVerify(orderNumber)}
        style={{
          backgroundColor: '#ffc107',
          color: 'black',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          minWidth: '50px'
        }}
      >
        Verify
      </button>
    );
  }

  return null;
};

const DealerPickup = () => {
  const [pickups, setPickups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' or 'cancel'
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyOrderNumber, setVerifyOrderNumber] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyingOrder, setVerifyingOrder] = useState(false);
  const [verifyOrderItems, setVerifyOrderItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const authStr = localStorage.getItem("KTMauth");
    if (!authStr) return;

    try {
      const auth = JSON.parse(authStr);
      const dealer_id = auth?.dealer_id;
      if (!dealer_id) return;

      axios
        .get(`${USER_API_ENDPOINTS.GET_DEALER_PICKUP_ORDER}${dealer_id}`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            // Group by order_number and use the most recent created_at for sorting
            const groupedOrders = res.data.reduce((acc, item) => {
              const orderNumber = item.order_number;
              if (!acc[orderNumber]) {
                acc[orderNumber] = {
                  order_number: orderNumber,
                  created_at: item.created_at,
                  updated_at: item.updated_at,
                  status: item.status,
                  order_total: item.order_total,
                  total_cart_items: item.total_cart_items,
                  customer_id: item.customer_id,
                  dealer_id: item.dealer_id,
                  order_id: item.order,
                  items: []
                };
              }
              
              // Add individual item to the order
              acc[orderNumber].items.push({
                id: item.id,
                subcategory_name: item.subcategory_name,
                subcategory_image: item.subcategory_image,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                GST: item.GST,
                percentage: item.percentage,
                total_amount: item.total_amount,
                cart_item: item.cart_item
              });
              
              return acc;
            }, {});

            // Convert to array and sort by created_at in descending order (latest first)
            const sortedOrders = Object.values(groupedOrders).sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            );
            
            setPickups(sortedOrders);
          } else {
            setPickups([]);
          }
        })
        .catch((err) => console.error("API Error:", err));
    } catch (err) {
      console.error("LocalStorage Parse Error:", err);
    }
  }, []);

  const totalPages = Math.ceil(pickups.length / rowsPerPage);
  const paginatedData = pickups.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAcceptOrder = async (orderNumber) => {
    const authStr = localStorage.getItem("KTMauth");
    if (!authStr) {
      Swal.fire({
        title: "Authentication Error",
        text: "Authentication not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      return;
    }

    try {
      const auth = JSON.parse(authStr);
      const dealer_id = auth?.dealer_id;
      if (!dealer_id) {
        Swal.fire({
          title: "Authentication Error",
          text: "Dealer ID not found. Please login again.",
          icon: "error",
          confirmButtonColor: "#56b124",
        });
        return;
      }

      // Show confirmation dialog using SweetAlert2
      const result = await Swal.fire({
        title: "Accept Order",
        text: "Are you sure you want to accept this order?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, accept it!",
        cancelButtonText: "No, cancel"
      });

      if (!result.isConfirmed) {
        return;
      }

      setProcessingOrder(orderNumber);
      setActionType('accept');

      const response = await axios.get(
        `${USER_API_ENDPOINTS.ACCEPT_ORDER_VIA_DEALER}${dealer_id}/${orderNumber}/`
      );

      if (response.data.Accepted) {
        Swal.fire({
          title: "Order Accepted!",
          text: "The order has been accepted successfully.",
          icon: "success",
          confirmButtonColor: "#56b124",
        });
        // Refresh the pickup data
        refreshPickupData();
      } else if (response.data.Unsuccessful) {
        Swal.fire({
          title: "Accept Failed",
          text: response.data.Unsuccessful,
          icon: "error",
          confirmButtonColor: "#56b124",
        });
      } else {
        Swal.fire({
          title: "Order Accepted!",
          text: "The order has been accepted successfully.",
          icon: "success",
          confirmButtonColor: "#56b124",
        });
        refreshPickupData();
      }
    } catch (error) {
      console.error("Accept order error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to accept order. Please try again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    } finally {
      setProcessingOrder(null);
      setActionType(null);
    }
  };

  const handleCancelOrder = async (orderNumber) => {
    const authStr = localStorage.getItem("KTMauth");
    if (!authStr) {
      Swal.fire({
        title: "Authentication Error",
        text: "Authentication not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      return;
    }

    try {
      const auth = JSON.parse(authStr);
      const dealer_id = auth?.dealer_id;
      if (!dealer_id) {
        Swal.fire({
          title: "Authentication Error",
          text: "Dealer ID not found. Please login again.",
          icon: "error",
          confirmButtonColor: "#56b124",
        });
        return;
      }

      // Show confirmation dialog using SweetAlert2
      const result = await Swal.fire({
        title: "Cancel Order",
        text: "Are you sure you want to cancel this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it"
      });

      if (!result.isConfirmed) {
        return;
      }

      setProcessingOrder(orderNumber);
      setActionType('cancel');

      const response = await axios.get(
        `${USER_API_ENDPOINTS.CANCEL_ORDER_VIA_DEALER}${dealer_id}/${orderNumber}/`
      );

      if (response.data.Cancelled) {
        Swal.fire({
          title: "Order Cancelled!",
          text: "The order has been cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#56b124",
        });
        // Refresh the pickup data
        refreshPickupData();
      } else if (response.data.Unsuccessful) {
        Swal.fire({
          title: "Cancellation Failed",
          text: response.data.Unsuccessful,
          icon: "error",
          confirmButtonColor: "#56b124",
        });
      } else {
        Swal.fire({
          title: "Order Cancelled!",
          text: "The order has been cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#56b124",
        });
        refreshPickupData();
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to cancel order. Please try again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    } finally {
      setProcessingOrder(null);
      setActionType(null);
    }
  };

  const refreshPickupData = async () => {
    const authStr = localStorage.getItem("KTMauth");
    if (!authStr) return;

    try {
      const auth = JSON.parse(authStr);
      const dealer_id = auth?.dealer_id;
      if (!dealer_id) return;

      const response = await axios.get(
        `${USER_API_ENDPOINTS.GET_DEALER_PICKUP_ORDER}${dealer_id}`
      );
      
      if (Array.isArray(response.data)) {
        // Group by order_number and use the most recent created_at for sorting
        const groupedOrders = response.data.reduce((acc, item) => {
          const orderNumber = item.order_number;
          if (!acc[orderNumber]) {
            acc[orderNumber] = {
              order_number: orderNumber,
              created_at: item.created_at,
              updated_at: item.updated_at,
              status: item.status,
              order_total: item.order_total,
              total_cart_items: item.total_cart_items,
              customer_id: item.customer_id,
              dealer_id: item.dealer_id,
              order_id: item.order,
              items: []
            };
          }
          
          // Add individual item to the order
          acc[orderNumber].items.push({
            id: item.id,
            subcategory_name: item.subcategory_name,
            subcategory_image: item.subcategory_image,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            GST: item.GST,
            percentage: item.percentage,
            total_amount: item.total_amount,
            cart_item: item.cart_item
          });
          
          return acc;
        }, {});

        // Convert to array and sort by created_at in descending order (latest first)
        const sortedOrders = Object.values(groupedOrders).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setPickups(sortedOrders);
      }
    } catch (error) {
      console.error("Refresh pickup data error:", error);
    }
  };

  const canProcessOrder = (status) => {
    // Allow accept/cancel for pending and confirmed orders
    const processableStatuses = ['pending', 'confirmed'];
    return processableStatuses.includes(status.toLowerCase());
  };

  const canViewOrder = (status) => {
    // Allow view only for accepted orders
    return status.toLowerCase().includes('accepted');
  };

  const isPickupDateToday = (pickupDate) => {
    if (!pickupDate) return false;
    
    const today = new Date();
    const pickup = new Date(pickupDate);
    
    // Compare only the date part (year, month, day)
    return (
      today.getFullYear() === pickup.getFullYear() &&
      today.getMonth() === pickup.getMonth() &&
      today.getDate() === pickup.getDate()
    );
  };

  const isPickupDatePast = (pickupDate) => {
    if (!pickupDate) return false;
    
    const today = new Date();
    const pickup = new Date(pickupDate);
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    pickup.setHours(0, 0, 0, 0);
    
    return pickup < today;
  };

  const handleViewOrder = async (orderNumber) => {
    setLoadingOrderDetails(true);
    setViewDialogOpen(true);
    
    try {
      const response = await axios.get(
        `${USER_API_ENDPOINTS.GET_ALL_ORDERS_OF_CUSTOMER_FOR_DEALER}${orderNumber}/`
      );
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const orderData = response.data[0];
        // pickup_date and pickup_time are directly in the response, not nested
        setSelectedOrderDetails({
          ...orderData,
          pickup_date: orderData.pickup_date,
          pickup_time: orderData.pickup_time
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "No order details found.",
          icon: "error",
          confirmButtonColor: "#56b124",
        });
        setViewDialogOpen(false);
      }
    } catch (error) {
      console.error("View order error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch order details. Please try again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      setViewDialogOpen(false);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedOrderDetails(null);
  };

  const handleLocateOnMap = async (digipin) => {
    try {
      const response = await axios.get(
        `${USER_API_ENDPOINTS.GET_DECODE}?digipin=${digipin}`
      );
      
      if (response.data && response.data.latitude && response.data.longitude) {
        const { latitude, longitude } = response.data;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        // Open Google Maps in a new window/tab
        window.open(mapsUrl, '_blank');
      } else {
        Swal.fire({
          title: "Location Error",
          text: "Unable to decode the location from digipin.",
          icon: "error",
          confirmButtonColor: "#56b124",
        });
      }
    } catch (error) {
      console.error("Locate on map error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to get location. Please try again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    }
  };

  const handleVerifyOrder = (orderNumber) => {
    // Find the order to get its items
    const order = pickups.find(p => p.order_number === orderNumber);
    if (order) {
      // Initialize items with current quantities
      const items = order.items.map(item => ({
        subcategory_name: item.subcategory_name,
        quantity: item.quantity.toString(),
        originalQuantity: item.quantity
      }));
      setVerifyOrderItems(items);
    }
    
    setVerifyOrderNumber(orderNumber);
    setVerifyOtp("");
    setVerifyDialogOpen(true);
  };

  const closeVerifyDialog = () => {
    setVerifyDialogOpen(false);
    setVerifyOrderNumber("");
    setVerifyOtp("");
    setVerifyOrderItems([]);
  };

  const updateItemQuantity = (index, newQuantity) => {
    const updatedItems = [...verifyOrderItems];
    updatedItems[index].quantity = newQuantity;
    setVerifyOrderItems(updatedItems);
  };

  const submitVerifyOrder = async () => {
    if (!verifyOtp.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter the OTP.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      return;
    }

    // Validate quantities
    const hasInvalidQuantity = verifyOrderItems.some(item => 
      !item.quantity.trim() || isNaN(item.quantity) || parseInt(item.quantity) <= 0
    );

    if (hasInvalidQuantity) {
      Swal.fire({
        title: "Error",
        text: "Please enter valid quantities for all items.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      return;
    }

    setVerifyingOrder(true);

    try {
      // Prepare items array for the API
      const items = verifyOrderItems.map(item => ({
        subcategory_name: item.subcategory_name,
        quantity: item.quantity.toString()
      }));

      const requestBody = {
        order_number: verifyOrderNumber,
        otp: verifyOtp.trim(),
        items: items
      };

      console.log("Verify order request:", requestBody);

      const response = await axios.post(
        USER_API_ENDPOINTS.UPDATE_ORDER_BY_DEALER,
        requestBody
      );

      if (response.data.msg === "Order updated successfully") {
        let successMessage = "The order has been verified successfully.";
        
        // Check if quantities were updated
        if (response.data.updated_items && response.data.updated_items.length > 0) {
          const updatedItemsText = response.data.updated_items
            .map(item => `${item.subcategory_name}: ${item.old_quantity} → ${item.new_quantity}`)
            .join('\n');
          successMessage += `\n\nQuantity Updates:\n${updatedItemsText}`;
        }

        Swal.fire({
          title: "Order Verified!",
          text: successMessage,
          icon: "success",
          confirmButtonColor: "#56b124",
        });
        
        // Refresh the pickup data
        refreshPickupData();
        closeVerifyDialog();
      } else {
        Swal.fire({
          title: "Verification Failed",
          text: response.data.msg || "Failed to verify order.",
          icon: "error",
          confirmButtonColor: "#56b124",
        });
      }
    } catch (error) {
      console.error("Verify order error:", error);
      
      let errorMessage = "Failed to verify order. Please try again.";
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    } finally {
      setVerifyingOrder(false);
    }
  };

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      <div className="user__dealer__pickup__section similar__section">
        <h1 className="similar__section__heading">Your Pickup Orders</h1>

        <div className="user__dealer__pickup">
          {pickups.length > 0 ? (
            <div className="pickup-table-container">
              <table className="pickup-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Price</th>
                    <th>Total Items</th>
                    <th>Status</th>
                    <th>Order Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((order) => (
                    <tr key={order.order_number}>
                      <td>{order.order_number}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ 
                          maxWidth: '200px',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}>
                          {order.items.map(item => item.subcategory_name).join(', ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          maxWidth: '150px',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}>
                          {order.items.map(item => `₹${item.price}`).join(', ')}
                        </div>
                      </td>
                      <td>{order.total_cart_items}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: 
                            order.status.toLowerCase().includes('pending') ? '#ffc107' :
                            order.status.toLowerCase().includes('accepted') ? '#28a745' :
                            order.status.toLowerCase().includes('cancelled') ? '#dc3545' :
                            order.status.toLowerCase().includes('completed') ? '#17a2b8' :
                            '#6c757d',
                          color: 'white'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td>₹{order.order_total}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {canProcessOrder(order.status) && (
                            <>
                              <button
                                onClick={() => handleAcceptOrder(order.order_number)}
                                disabled={processingOrder === order.order_number && actionType === 'accept'}
                                style={{
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: processingOrder === order.order_number ? 'not-allowed' : 'pointer',
                                  fontSize: '11px',
                                  opacity: processingOrder === order.order_number ? 0.6 : 1,
                                  minWidth: '50px'
                                }}
                              >
                                {processingOrder === order.order_number && actionType === 'accept' ? 'Processing...' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.order_number)}
                                disabled={processingOrder === order.order_number && actionType === 'cancel'}
                                style={{
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: processingOrder === order.order_number ? 'not-allowed' : 'pointer',
                                  fontSize: '11px',
                                  opacity: processingOrder === order.order_number ? 0.6 : 1,
                                  minWidth: '50px'
                                }}
                              >
                                {processingOrder === order.order_number && actionType === 'cancel' ? 'Processing...' : 'Cancel'}
                              </button>
                            </>
                          )}
                          {/* Show view button only for accepted orders and only on pickup date */}
                          {canViewOrder(order.status) && (
                            <ViewButton 
                              orderNumber={order.order_number} 
                              onView={handleViewOrder}
                            />
                          )}
                          {/* Show verify button for accepted orders on pickup date, or completed for past pickup date */}
                          {canViewOrder(order.status) && (
                            <VerifyButton 
                              orderNumber={order.order_number}
                              status={order.status}
                              onVerify={handleVerifyOrder}
                            />
                          )}
                          {!canProcessOrder(order.status) && !canViewOrder(order.status) && (
                            <span style={{ fontSize: '11px', color: '#6c757d' }}>No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination-wrapper">
                <div className="pagination-info">
                  Showing {paginatedData.length} out of {pickups.length}
                </div>

                <div className="pagination-buttons">
                  <button onClick={handlePrev} disabled={currentPage === 1}>
                    &lt;
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={page === currentPage ? "active" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}

                  <button onClick={handleNext} disabled={currentPage === totalPages}>
                    &gt;
                  </button>
                </div>

                <div className="pagination-select">
                  <span>Rows per page</span>
                  <select value={rowsPerPage} onChange={handleRowsChange}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <p>No pickup data available.</p>
          )}
        </div>
      </div>

      {/* View Order Details Dialog */}
      {viewDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #56b124',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#56b124' }}>Order Details</h2>
              <button
                onClick={closeViewDialog}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {loadingOrderDetails ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading order details...</p>
              </div>
            ) : selectedOrderDetails ? (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <strong>Order Number:</strong>
                    <p style={{ margin: '5px 0', color: '#56b124', fontWeight: 'bold' }}>
                      {selectedOrderDetails.order_number}
                    </p>
                  </div>
                  <div>
                    <strong>Customer Name:</strong>
                    <p style={{ margin: '5px 0' }}>
                      {selectedOrderDetails.first_name} {selectedOrderDetails.last_name}
                    </p>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <p style={{ margin: '5px 0' }}>{selectedOrderDetails.phone}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p style={{ margin: '5px 0' }}>{selectedOrderDetails.email}</p>
                  </div>
                  <div>
                    <strong>Order Total:</strong>
                    <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>
                      ₹{selectedOrderDetails.order_total}
                    </p>
                  </div>
                  <div>
                    <strong>Tax:</strong>
                    <p style={{ margin: '5px 0' }}>₹{selectedOrderDetails.tax}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p style={{ 
                      margin: '5px 0',
                      color: selectedOrderDetails.status.toLowerCase().includes('accepted') ? '#28a745' : '#666'
                    }}>
                      {selectedOrderDetails.status}
                    </p>
                  </div>
                  <div>
                    <strong>Pickup Date:</strong>
                    <p style={{ margin: '5px 0' }}>{selectedOrderDetails.pickup_date}</p>
                  </div>
                  <div>
                    <strong>Pickup Time:</strong>
                    <p style={{ margin: '5px 0' }}>{selectedOrderDetails.pickup_time}</p>
                  </div>
                  {selectedOrderDetails.digipin && (
                    <div>
                      <strong>Digipin:</strong>
                      <p style={{ margin: '5px 0' }}>{selectedOrderDetails.digipin}</p>
                      <button
                        onClick={() => handleLocateOnMap(selectedOrderDetails.digipin)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '5px'
                        }}
                      >
                        Locate on Map
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <strong>Address:</strong>
                  <p style={{ margin: '5px 0', lineHeight: '1.5' }}>
                    {selectedOrderDetails.address_line_1}
                    {selectedOrderDetails.address_line_2 && `, ${selectedOrderDetails.address_line_2}`}
                    <br />
                    {selectedOrderDetails.city}, {selectedOrderDetails.state}, {selectedOrderDetails.country}
                  </p>
                </div>

                {selectedOrderDetails.order_note && (
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Order Note:</strong>
                    <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#666' }}>
                      {selectedOrderDetails.order_note}
                    </p>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={closeViewDialog}
                    style={{
                      backgroundColor: '#56b124',
                      color: 'white',
                      border: 'none',
                      padding: '10px 30px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>No order details available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verify Order Dialog */}
      {verifyDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #56b124',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#56b124' }}>Verify Order</h2>
              <button
                onClick={closeVerifyDialog}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                Order Number: {verifyOrderNumber}
              </p>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                Please enter the OTP provided by the customer and verify/update item quantities.
              </p>
              
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                OTP:
              </label>
              <input
                type="text"
                value={verifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  marginBottom: '20px'
                }}
              />

              {/* Items Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Items & Quantities:
                </label>
                {verifyOrderItems.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <strong>{item.subcategory_name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Original: {item.originalQuantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, e.target.value)}
                        style={{
                          width: '60px',
                          padding: '5px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeVerifyDialog}
                disabled={verifyingOrder}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: verifyingOrder ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: verifyingOrder ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitVerifyOrder}
                disabled={verifyingOrder || !verifyOtp.trim()}
                style={{
                  backgroundColor: verifyingOrder || !verifyOtp.trim() ? '#6c757d' : '#56b124',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: verifyingOrder || !verifyOtp.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {verifyingOrder ? 'Verifying...' : 'Verify Order'}
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

export default DealerPickup;
