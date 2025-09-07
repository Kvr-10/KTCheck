import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";

// css
import "../../App.css";
import "../../Css/Cart.css";

// component
import CartView from "./CartView";

// redux
import { useDispatch, useSelector } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const CartStep3 = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isOpen, setIsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [pickupAddressDetails, setPickupAddressDetails] = useState(null);

  // Get data from localStorage
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const customerId = apiKey?.customer_id;

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (customerId) {
          const initializationResponses = JSON.parse(localStorage.getItem("initialization_responses")) || [];
          if (initializationResponses.length > 0) {
            const orderId = initializationResponses[0].order_id;
            const response = await axios.get(`${USER_API_ENDPOINTS.GET_ORDER_DETAILS}${customerId}/${orderId}`);

            // Debugging logs
            console.log("API Response:", response.data);

            // Store the response in localStorage
            localStorage.setItem('order_details_full_response', JSON.stringify(response.data));

            // Set the state with the API response
            setOrderDetails(response.data);
            setPickupAddressDetails(response.data.length > 1 ? response.data[1] : null);

            // Debugging logs
            console.log("Pickup Address Details:", response.data.length > 1 ? response.data[1] : null);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching order details from API:", error);
      }
    };

    fetchOrderDetails();
    window.scrollTo(0, 0);
  }, [customerId]);

  // Listen for localStorage changes (in case CartView updates the data)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedOrderDetails = JSON.parse(localStorage.getItem("order_details_full_response")) || [];
      if (updatedOrderDetails.length > 0) {
        setOrderDetails(updatedOrderDetails);
        setPickupAddressDetails(updatedOrderDetails.length > 1 ? updatedOrderDetails[1] : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case the storage event doesn't fire
    const interval = setInterval(() => {
      const currentData = JSON.parse(localStorage.getItem("order_details_full_response")) || [];
      if (currentData.length > 0 && JSON.stringify(currentData) !== JSON.stringify(orderDetails)) {
        setOrderDetails(currentData);
        setPickupAddressDetails(currentData.length > 1 ? currentData[1] : null);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [orderDetails]);

  const checkOut = () => {
    // Checkout logic here...
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="cart__step">
        <h1>Final Checkout</h1>

        <CartView />

        {/* {pickupAddressDetails && (
          <div className="final__pickup__address">
            <h1>Pickup Address</h1>
            <div className="pickup__address">
              <div className="left__side">
                <p>
                  Name : <span>{pickupAddressDetails.full_name}</span>
                </p>
                <p>
                  Mobile Number : <span>{pickupAddressDetails.phone}</span>
                </p>
                <p>
                  Email ID : <span>{pickupAddressDetails.email}</span>
                </p>
                <p>
                  Address : <span>{pickupAddressDetails.full_address}</span>
                </p>
                <p>
                  State : <span>{pickupAddressDetails.state}</span>
                </p>
                {pickupAddressDetails.order_note && (
                  <p>
                    Order Note : <span>{pickupAddressDetails.order_note}</span>
                  </p>
                )}
              </div>

              <div className="right__side">
                <p>
                  City : <span>{pickupAddressDetails.city}</span>
                </p>
                <p>
                  Country : <span>{pickupAddressDetails.country}</span>
                </p>
                <p>
                  Date : <span>{pickupAddressDetails.pickup_date}</span>
                </p>
                <p>
                  Time Slot : <span>{pickupAddressDetails.pickup_time}</span>
                </p>
                {pickupAddressDetails.digipin && (
                  <p>
                    Digipin : <span>{pickupAddressDetails.digipin}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )} */}
        {/* 
        <button
          className="cart__button"
          onClick={() => {
            dispatch(stepReducerActions.backward("cartStep"));
          }}
        >
          Back
        </button> */}
        <button
          className="cart__button"
          onClick={checkOut}
        >
          Check out
        </button>

        <Modal
          isOpen={isOpen}
          ariaHideApp={false}
          style={{
            content: {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "40px 60px",
              borderRadius: "20px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
              width: "90%",
              maxWidth: "500px",
              minWidth: "320px",
              maxHeight: "90vh",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            },
          }}
        >

          <h1 style={{ 
            color: "#56b124", 
            marginBottom: "25px", 
            fontSize: "2.2rem",
            fontWeight: "700"
          }}>
            Thank You!
          </h1>
          <p style={{ 
            marginBottom: "35px", 
            fontSize: "1.1rem",
            color: "#666",
            lineHeight: "1.5"
          }}>
            Your pickup request has been successfully placed.
          </p>
          <div>
            <button
              style={{
                backgroundColor: "#56b124",
                color: "#fff",
                padding: "15px 30px",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(86, 177, 36, 0.3)",
                minWidth: "150px"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#05242a";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(86, 177, 36, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#56b124";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(86, 177, 36, 0.3)";
              }}
              onClick={() => {
                dispatch(stepReducerActions.reset("cartStep"));
                setIsOpen(!isOpen);
                localStorage.removeItem("order_details_full_response");
                history.push("/sell/user/pickup");
              }}
            >
              Sell Again
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default CartStep3;
