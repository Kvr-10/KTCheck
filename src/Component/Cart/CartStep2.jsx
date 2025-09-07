import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";

// css
import "../../Css/Cart.css";
import "../../Css/Auth.css";
import "../../Css/ModernForm.css";

// redux
import { useDispatch, useSelector } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";
import axios from "axios";
import { apiUrl } from "../../Private";
import Swal from "sweetalert2";
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { Link } from "react-router-dom";
import UserAddressCard from "../User/UserProfile/UserAddressCard";
import { getAccessTokenFromRefresh } from "../../utils/helper";

const CartStep2 = () => {
  const dispatch = useDispatch();
  const [userAddress, setUserAddress] = useState([]);
  const [cartDetails, setCartDetails] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const apiKey = JSON.parse(localStorage.getItem("KTMauth")); // Use KTMauth for user data
  const customerId = apiKey?.customer_id; // Extract customer_id from KTMauth
  const details = JSON.parse(localStorage.getItem("order_details")) || {};
  const [inputValue, setInputValue] = useState({
    firstname: apiKey?.full_name?.split(" ")[0] || "",
    lastname: apiKey?.full_name?.split(" ")[1] || "",
    phone: apiKey?.phone_number || "",
    email: apiKey?.email || "",
    digipin: "",
    pincode: "",
    add_one: "",
    add_two: "",
    city: "",
    state: "",
    country: "India",
    pickup_date: "",
    pickup_time: "8am - 1pm",
    order_note: "",
  });

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        if (!customerId) {
          console.error("Customer ID is missing");
          return;
        }

        const response = await axios.get(`${USER_API_ENDPOINTS.VIEW_CART}${customerId}`);
        console.log("Cart details:", response.data);
        setCartDetails(response.data);
      } catch (error) {
        console.error("Error fetching cart details:", error);
      }
    };

    fetchCartDetails();
  }, [customerId]);

  // Fetch user addresses
  useEffect(() => {
    fetchUserAddress();
  }, []);

  const fetchUserAddress = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      const res = await axios.get(USER_API_ENDPOINTS.GET_ADDRESS, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUserAddress([...res.data]);
    } catch (error) {
      console.error("❌ Error fetching user address:", error);
    }
  };

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update form values when user clicks an address
  const useAddress = (selectedAddress) => {
    // console.log("Selected Address:", selectedAddress);
    setInputValue({
      ...inputValue,
      add_one: selectedAddress.add_line1,
      add_two: selectedAddress.add_line2,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.zipcode.toString(),
      digipin: selectedAddress.digipin_data || "",
    });

    details["address_line_1"] = selectedAddress.add_line1;
    details["address_line_2"] = selectedAddress.add_line2;
    details["city"] = selectedAddress.city;
    details["state"] = selectedAddress.state;
    details["pincode"] = selectedAddress.zipcode.toString();
    details["digipin"] = selectedAddress.digipin_data || "";

    localStorage.setItem("order_details", JSON.stringify(details));
    setShowAddressModal(false);
    
    // Show confirmation
    Swal.fire({
      title: "Address Selected!",
      text: `${selectedAddress.add_line1}, ${selectedAddress.city}`,
      icon: "success",
      confirmButtonColor: "#56b124",
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Get user location and fetch digipin
  const getUserLocationAndDigipin = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          setUserLocation({ lat, lon });
          
          try {
            // Fetch digipin using the coordinates
            const digipinResponse = await axios.get(`${USER_API_ENDPOINTS.GET_ENCODE}?lat=${lat}&lon=${lon}`);
            
            // Fetch address details using reverse geocoding
            const addressResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
            
            if (digipinResponse.data && digipinResponse.data.digipin) {
              const addressData = addressResponse.data;
              
              // Parse the display_name to extract address components
              // Format: "Haveli, Pune, Maharashtra, 411048, India"
              const displayName = addressData?.display_name || "";
              const addressParts = displayName.split(", ").map(part => part.trim());
              
              let city = "";
              let state = "";
              let postcode = "";
              
              if (addressParts.length >= 4) {
                // Extract from the end: country (last), pincode (second last), state (third last), city (fourth last)
                postcode = addressParts[addressParts.length - 2]; // Second last is pincode
                state = addressParts[addressParts.length - 3]; // Third last is state
                city = addressParts[addressParts.length - 4]; // Fourth last is city
              }
              
              // Fallback to address object if display_name parsing fails
              if (!city || !state || !postcode) {
                const address = addressData?.address || {};
                city = city || address.city || address.town || address.village || "";
                state = state || address.state || "";
                postcode = postcode || address.postcode || "";
              }
              
              setInputValue(prev => ({
                ...prev,
                digipin: digipinResponse.data.digipin,
                pincode: postcode,
                city: city,
                state: state,
                // Keep existing address lines unchanged
                // add_one: prev.add_one,
                // add_two: prev.add_two
              }));
              
              // Update localStorage
              details["digipin"] = digipinResponse.data.digipin;
              details["pincode"] = postcode;
              details["city"] = city;
              details["state"] = state;
              // Don't update address lines automatically
              // details["address_line_1"] = addressLine1;
              // details["address_line_2"] = addressLine2;
              localStorage.setItem("order_details", JSON.stringify(details));
              
              Swal.fire({
                title: "Location Found!",
                text: `Digipin: ${digipinResponse.data.digipin}`,
                icon: "success",
                confirmButtonColor: "#56b124",
                timer: 2000
              });
            }
          } catch (error) {
            console.error("Error fetching location data:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to fetch location data. Please try again.",
              icon: "error",
              confirmButtonColor: "#56b124",
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          
          let errorMessage = "Unable to get location.";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          Swal.fire({
            title: "Location Error",
            text: errorMessage,
            icon: "error",
            confirmButtonColor: "#56b124",
          });
        }
      );
    } else {
      setLocationLoading(false);
      Swal.fire({
        title: "Not Supported",
        text: "Geolocation is not supported by this browser.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    }
  };

  // Handle form input changes
  const getInputValue = (e) => {
    setInputValue({
      ...inputValue,
      [e.target.name]: e.target.value,
    });
    details[e.target.name] = e.target.value;
    localStorage.setItem("order_details", JSON.stringify(details));
  };

  const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate() + 1).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const date = new Date().toISOString().slice(0, 10);
    setInputValue({
      ...inputValue,
      pickup_date: date,
    });
    details["pickup_date"] = date;
    localStorage.setItem("order_details", JSON.stringify(details));

    // Change the color of the date input to green
    const dateInput = document.querySelector("input[name='pickup_date']");
    if (dateInput) {
      dateInput.style.borderColor = "#10b981";
      dateInput.style.backgroundColor = "#eefbeeff"; // Light green background
    }
  }, []);

  // Confirm order
  const confirmOrder = async () => {
    try {
      // Create a single POST request for order details
      const orderResponse = await axios.post(USER_API_ENDPOINTS.TAKE_ORDER_DETAILS, {
        customer_id: customerId,
        // first_name: inputValue.firstname,
        // last_name: inputValue.lastname,
        phone: inputValue.phone,
        email: inputValue.email,
        address_line_1: inputValue.add_one,
        address_line_2: inputValue.add_two,
        city: inputValue.city,
        state: inputValue.state,
        country: inputValue.country,
        pincode: inputValue.pincode,
        pickup_date: inputValue.pickup_date,
        pickup_time: inputValue.pickup_time,
        order_note: inputValue.order_note,
        digipin: inputValue.digipin,
        ip: "127.0.0.1", // Static value
        status: "pending", // Static value
      });

      console.log("Order Response:", orderResponse.data);

      // Save the orders in localStorage
      const orders = orderResponse.data.orders; // Extract orders from the response
      localStorage.setItem("order_details_responses", JSON.stringify(orders)); // Save orders array in localStorage

      // console.log("Orders saved in localStorage:", orders);

      // Perform order initialization for each order
      const initializationPromises = orders.map((order) =>
        axios.post(USER_API_ENDPOINTS.ORDER_INITIALIZATION, {
          order: order.order_id,
          order_number: order.order_number,
        })
      );

      const initializationResponses = await Promise.all(initializationPromises);

      // Save initialization responses in localStorage
      localStorage.setItem("initialization_responses", JSON.stringify(initializationResponses.map((res) => res.data)));

      // console.log("Initialization Responses:", initializationResponses);

      // Show success message
      Swal.fire({
        title: "Order Confirmed!",
        text: `Your orders have been placed successfully.`,
        icon: "success",
        confirmButtonColor: "#56b124",
      });

      // Move to the next step
      dispatch(stepReducerActions.forward("cartStep"));
    } catch (error) {
      console.error("Error confirming order:", error);

      // Show error message
      Swal.fire({
        title: "Order Failed!",
        text: "Something went wrong while placing your order.",
        icon: "error",
        confirmButtonColor: "#56b124",
      });
    }
  };

  return (
    <>
      <div className="cart__step">
        <h1>Your Pickup Address</h1>
        {/* Address selection and form */}
        <div className="cart__pickup__input">
          {/* Choose Address Button */}
          <div className="address-selection-section">
            <button 
              className="choose-address-btn"
              onClick={() => setShowAddressModal(true)}
              disabled={userAddress.length === 0}
              style={{
                backgroundColor: userAddress.length === 0 ? "#ccc" : "#56b124",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: userAddress.length === 0 ? "not-allowed" : "pointer",
                marginBottom: "20px",
                fontSize: "16px"
              }}
            >
               Choose Address {/*({userAddress.length} saved addresses) */}
            </button>
            
            {userAddress.length === 0 && (
              <div style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 10px 0", color: "#856404" }}>
                  <strong>No saved addresses found!</strong>
                </p>
                <p style={{ margin: "0 0 15px 0", color: "#856404" }}>
                  Please add an address to your profile first, then come back to select it.
                </p>
                <Link 
                  to="/sell/user/address" 
                  style={{
                    backgroundColor: "#56b124",
                    color: "white",
                    textDecoration: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    display: "inline-block"
                  }}
                >
                  Manage Addresses
                </Link>
              </div>
            )}
            
            {/* Show current address if selected
            {inputValue.add_one && (
              <div style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #56b124",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px",
                textAlign: "left"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#56b124" }}>Selected Address:</h4>
                <div><strong>{inputValue.add_one}</strong></div>
                {inputValue.add_two && <div>{inputValue.add_two}</div>}
                <div>{inputValue.city}, {inputValue.state} - {inputValue.pincode}</div>
                {inputValue.digipin && <div>Digipin: {inputValue.digipin}</div>}
              </div>
            )} */}
          </div>

          {/* Address Modal */}
          <Modal
            isOpen={showAddressModal}
            onRequestClose={() => setShowAddressModal(false)}
            ariaHideApp={false}
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000
              },
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80%',
                overflow: 'auto',
                padding: '20px'
              }
            }}
          >
            <div className="address-modal-content">
              <h2>Select Address</h2>
              {userAddress.length !== 0 ? (
                <div className="address-list">
                  {userAddress.map((address, index) => (
                    <div 
                      key={address.id} 
                      className="address-item"
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "10px",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => useAddress(address)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f5f5f5";
                        e.target.style.borderColor = "#56b124";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                        e.target.style.borderColor = "#ddd";
                      }}
                    >
                      <div><strong>{address.add_line1}</strong></div>
                      <div>{address.add_line2}</div>
                      <div>{address.landmark}</div>
                      <div>{address.city}, {address.state} - {address.zipcode}</div>
                      <div>{address.country}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>No saved addresses found.</p>
                  <p>Please add an address in your profile first.</p>
                  <Link 
                    to="/user-profile/address" 
                    style={{
                      backgroundColor: "#56b124",
                      color: "white",
                      textDecoration: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      display: "inline-block",
                      marginTop: "10px"
                    }}
                  >
                    Add Address
                  </Link>
                </div>
              )}
              <button 
                onClick={() => setShowAddressModal(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "15px"
                }}
              >
                Close
              </button>
            </div>
          </Modal>

          {/* Form */}
          <div className="input">
            <div>
              <label>First Name</label>
              <input
                type="text"
                onChange={getInputValue}
                value={inputValue.firstname}
                name="firstname"
                required
                disabled
                className={inputValue.firstname ? 'filled-disabled' : ''}
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                type="text"
                onChange={getInputValue}
                value={inputValue.lastname}
                name="lastname"
                required
                disabled
                className={inputValue.lastname ? 'filled-disabled' : ''}
              />
            </div>
          </div>
          <div className="input">
            <div>
              <label>Mobile Number</label>
              <input type="tel" onChange={getInputValue} value={inputValue.phone} name="phone" required />
            </div>
            <div>
              <label>Email ID</label>
              <input
                type="email"
                onChange={getInputValue}
                value={inputValue.email}
                name="email"
                required
                disabled
                className={inputValue.email ? 'filled-disabled' : ''}
              />
            </div>
          </div>
          <div className="input">
            <div>
              <label data-optional>Digipin</label>
              <div className="digipin-input-wrapper">
                <input
                  type="text"
                  onChange={getInputValue}
                  value={inputValue.digipin}
                  name="digipin"
                  placeholder="Enter your Digipin"
                />
                <button
                  type="button"
                  onClick={getUserLocationAndDigipin}
                  className={`digipin-locate-btn ${locationLoading ? 'loading' : ''}`}
                  disabled={locationLoading}
                  title="Auto Detect Location"
                >
                  {locationLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label>Pincode</label>
              <input type="text" onChange={getInputValue} value={inputValue.pincode} name="pincode" required />
            </div>
          </div>
          <div className="input">
            <div>
              <label>City</label>
              <input type="text" onChange={getInputValue} value={inputValue.city} name="city" required />
            </div>
            <div>
              <label>State</label>
              <input type="text" onChange={getInputValue} value={inputValue.state} name="state" required />
            </div>
          </div>
          <div className="input">
            <div>
              <label>House no. / Flat no.</label>
              <input type="text" onChange={getInputValue} value={inputValue.add_one} name="add_one" required />
            </div>
            <div>
              <label>Address</label>
              <input type="text" onChange={getInputValue} value={inputValue.add_two} name="add_two" required />
            </div>
          </div>
          <div className="input">
            <div>
              <label>Select Date</label>
              <DatePicker
                selected={inputValue.pickup_date ? new Date(inputValue.pickup_date) : null}
                onChange={(date) => {
                  const formattedDate = date.toISOString().slice(0, 10);
                  setInputValue({ ...inputValue, pickup_date: formattedDate });
                  details["pickup_date"] = formattedDate;
                  localStorage.setItem("order_details", JSON.stringify(details));
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className={`custom-date-picker ${inputValue.pickup_date ? 'date-selected' : ''}`}
              />
            </div>
            <div>
              <label>Select Time Slot</label>
              <select onChange={getInputValue} value={inputValue.pickup_time} name="pickup_time" required>
                <option>8am - 1pm</option>
                <option>1pm - 6pm</option>
              </select>
            </div>
          </div>
          <div className="input order-notes-row">
            <div>
              <label data-optional>Order Notes</label>
              <textarea
                onChange={getInputValue}
                value={inputValue.order_note}
                name="order_note"
                placeholder="Add any special instructions here"
              />
            </div>
          </div>
        </div>

        <button className="cart__button" onClick={() => dispatch(stepReducerActions.backward("cartStep"))}>Back</button>
        <button className="cart__button" onClick={confirmOrder}>Next</button>
      </div>
    </>
  );
};

export default CartStep2;