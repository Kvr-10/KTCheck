import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Components
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// Styles
import "../../../Css/UserDealerPickup.css";
import "../../../App.css";

// API
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const UserPickup = () => {
  const [pickupData, setPickupData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showInvoiceInput, setShowInvoiceInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderOtp, setSelectedOrderOtp] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("KTMauth"));
    if (!user?.customer_id) return;
    console.log("Customer ID:", user.customer_id);

    axios
      .get(`${USER_API_ENDPOINTS.GET_CUSTOMER_PICKUP_ORDER}${user.customer_id}/`)
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
                pickup_date: item.pickup_date,
                pickup_time: item.pickup_time,
                otp: item.otp,
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

          setPickupData(sortedOrders);
        } else {
          console.warn("Expected array but got:", res.data);
          setPickupData([]);
        }
      })
      .catch((err) => {
        console.error("Pickup fetch error:", err);
        setPickupData([]);
      });
  }, []);

  const totalPages = Math.ceil(pickupData.length / rowsPerPage);
  const paginatedData = pickupData.slice(
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

  const handleCancelOrder = async (orderNumber) => {
    const user = JSON.parse(localStorage.getItem("KTMauth"));
    if (!user?.customer_id) {
      Swal.fire({
        title: "Authentication Error",
        text: "Customer ID not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
      return;
    }

    console.log("Cancelling order for Customer ID:", user.customer_id, "Order Number:", orderNumber);

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

    setCancellingOrder(orderNumber);

    try {
      const response = await axios.get(
        `${USER_API_ENDPOINTS.CANCEL_ORDER_VIA_CUSTOMER}${user.customer_id}/${orderNumber}/`
      );

      if (response.data.Cancelled) {
        Swal.fire({
          title: "Order Cancelled!",
          text: "Your order has been cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#56b124",
        });

        // Refresh the pickup data
        const updatedResponse = await axios.get(
          `${USER_API_ENDPOINTS.GET_CUSTOMER_PICKUP_ORDER}${user.customer_id}/`
        );
        if (Array.isArray(updatedResponse.data)) {
          // Group by order_number and use the most recent created_at for sorting
          const groupedOrders = updatedResponse.data.reduce((acc, item) => {
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
                pickup_date: item.pickup_date,
                pickup_time: item.pickup_time,
                otp: item.otp,
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

          setPickupData(sortedOrders);
        }
      } else if (response.data.Unsuccessful) {
        Swal.fire({
          title: "Cancellation Failed",
          text: response.data.Unsuccessful,
          icon: "error",
          confirmButtonColor: "#56b124",
        });
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
      setCancellingOrder(null);
    }
  };

  const canCancelOrder = (status) => {
    // Allow cancellation for both pending and confirmed orders
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(status.toLowerCase());
  };

  const canGetInvoice = (status) => status === "Pending" || status === "Confirmed" || status === "Completed";

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

  const handleShowOtp = (otp) => {
    setSelectedOrderOtp(otp);
    setShowOtpModal(true);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setSelectedOrderOtp("");
  };

  return (
    <>
      <Navbar />
      <UserProfileSearchbar />
      <UserProfileNavbar />

      <div className="user__dealer__pickup__section similar__section">
        <h1 className="similar__section__heading">Your Pickup Orders</h1>

        <div className="user__dealer__pickup">
          {pickupData.length > 0 ? (
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
                              order.status.toLowerCase().includes('confirmed') ? '#28a745' :
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
                        <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
                          <button
                            className="cancel-order-btn"
                            onClick={() => window.open(`${USER_API_ENDPOINTS.CUSTOMER_ORDER_INVOICE}${order.order_number}`, "_blank")}
                            style={{
                              backgroundColor: canGetInvoice(order.status) ? "#56b124" : "#6c757d",
                              color: "white",
                              border: "none",
                              width: "60px",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: canGetInvoice(order.status) ? "pointer" : "not-allowed",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",     // ✅ vertically center text
                              justifyContent: "center", // ✅ horizontally center text
                            }}
                            disabled={!canGetInvoice(order.status)}
                          >
                            Invoice
                          </button>

                          {isPickupDateToday(order.pickup_date) && order.otp && !['cancelled', 'cancelled by customer'].includes(order.status.toLowerCase()) && (
                            <button
                              onClick={() => handleShowOtp(order.otp)}
                              style={{
                                backgroundColor: "#309f9dff",
                                color: "white",
                                border: "none",
                                width: "50px",
                                padding: "5px 10px",
                                borderRadius: "4px",
                                cursor: ['cancelled', 'cancelled by customer'].includes(order.status.toLowerCase()) ? "not-allowed" : "pointer",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: ['cancelled', 'cancelled by customer'].includes(order.status.toLowerCase()) ? 0.6 : 1
                              }}
                              disabled={['cancelled', 'cancelled by customer'].includes(order.status.toLowerCase())}
                            >
                              OTP
                            </button>
                          )}

                          <button
                            className="cancel-order-btn"
                            onClick={() => canCancelOrder(order.status) ? handleCancelOrder(order.order_number) : null}
                            disabled={!canCancelOrder(order.status) || cancellingOrder === order.order_number}
                            style={{
                              backgroundColor: canCancelOrder(order.status) ? '#dc3545' : '#6c757d',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: (!canCancelOrder(order.status) || cancellingOrder === order.order_number) ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: "flex",
                              alignItems: "center",     // ✅ vertically center text
                              justifyContent: "center", // ✅ horizontally center text
                              opacity: (!canCancelOrder(order.status) || cancellingOrder === order.order_number) ? 0.6 : 1
                            }}
                          >
                            {cancellingOrder === order.order_number ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

              <div className="pagination-wrapper">
                <div className="pagination-info">
                  Showing {paginatedData.length} out of {pickupData.length}
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
            <p>No pickup data available here.</p>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
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
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b124', fontSize: '1.3rem' }}>Your OTP</h2>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              marginBottom: '20px',
              letterSpacing: '4px'
            }}>
              {selectedOrderOtp}
            </div>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              Share this OTP with the dealer during pickup
            </p>
            <button
              onClick={closeOtpModal}
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
      )}

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default UserPickup;
