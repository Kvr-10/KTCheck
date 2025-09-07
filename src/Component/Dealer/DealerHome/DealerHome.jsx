import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

// css
import "../../../Css/DealerHome.css";
import "../../../App.css";

// component
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import DealerHomeCard from "./DealerHomeCard";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";
import axios from "axios";
import { apiUrl } from "../../../Private";
import { USER_API_ENDPOINTS } from "../../../utils/apis"; // Make sure this is imported

const DealerHome = () => {
  const [pickupData, setPickupData] = useState([]);
  const [homeData, setHomeData] = useState([
    { title: "Total Pickup", number: "0" },
    { title: "Total Category", number: "0" },
    { title: "Total Successful", number: "0" },
    { title: "Total Cancel", number: "0" },
    { title: "Total Today Pickup", number: "0" },
    { title: "Inquiries", number: "0" },
    { title: "Scheduled Pickups", number: "0" },
  ]);
  const [x, setX] = useState(0);
  const [t, setT] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPickupCount, setTotalPickupCount] = useState(0); // New state for total pickup count
  const [totalSuccessfulCount, setTotalSuccessfulCount] = useState(0); // New state for total successful count
  const [totalCancelCount, setTotalCancelCount] = useState(0); // New state for total cancel count
  const [totalTodayPickupCount, setTotalTodayPickupCount] = useState(0); // New state for total today pickup count
  const [totalCategoryCount, setTotalCategoryCount] = useState(0); // New state for total category count
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [inquiriesData, setInquiriesData] = useState([]); // Store inquiries data
  const [showInquiriesModal, setShowInquiriesModal] = useState(false); // Modal state
  const [scheduledPickupsCount, setScheduledPickupsCount] = useState(0);
  const [scheduledPickupsData, setScheduledPickupsData] = useState([]); // Store scheduled pickups data
  const [showScheduledPickupsModal, setShowScheduledPickupsModal] = useState(false); // Modal state
  const [selectedPickup, setSelectedPickup] = useState(null); // For detailed view

  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const history = useHistory();

  // Get total pickup data using GET_DEALER_PICKUP_ORDER API
  useEffect(() => {
    if (apiKey && apiKey.dealer_id) {
      console.log("Fetching total pickup data for dealer_id:", apiKey.dealer_id);
      
      axios
        .get(`${USER_API_ENDPOINTS.GET_DEALER_PICKUP_ORDER}${apiKey.dealer_id}/`)
        .then((res) => {
          console.log("Total pickup API response:", res.data);
          
          // Get today's date in YYYY-MM-DD format
          const todayDate = getDate();
          console.log("Today's date:", todayDate);
          
          // Filter pickups by different statuses
          const validPickups = res.data.filter(pickup => 
            pickup.status === "Pending" || pickup.status === "Accepted"
          );
          
          const successfulPickups = res.data.filter(pickup => 
            pickup.status === "Accepted"
          );
          
          const cancelledPickups = res.data.filter(pickup => 
            pickup.status === "Cancelled by dealer" || pickup.status === "Cancelled by Customer"
          );
          
          // Filter today's pickups based on pickup_date (only Accepted status)
          const todayPickups = res.data.filter(pickup => {
            const pickupDate = pickup.pickup?.pickup_date;
            const isToday = pickupDate === todayDate;
            const isAccepted = pickup.status === "Accepted";
            console.log(`Pickup ${pickup.id}: pickup_date=${pickupDate}, isToday=${isToday}, status=${pickup.status}, isAccepted=${isAccepted}`);
            return isToday && isAccepted;
          });
          
          const totalCount = validPickups.length;
          const successfulCount = successfulPickups.length;
          const cancelCount = cancelledPickups.length;
          const todayCount = todayPickups.length;
          
          console.log("Total valid pickups count:", totalCount);
          console.log("Total successful pickups count:", successfulCount);
          console.log("Total cancelled pickups count:", cancelCount);
          console.log("Total today pickups count:", todayCount);
          
          setTotalPickupCount(totalCount);
          setTotalSuccessfulCount(successfulCount);
          setTotalCancelCount(cancelCount);
          setTotalTodayPickupCount(todayCount);
          
          // Update homeData with all counts
          setHomeData((prevData) =>
            prevData.map((item) => {
              if (item.title === "Total Pickup") {
                return { ...item, number: totalCount.toString() };
              } else if (item.title === "Total Successful") {
                return { ...item, number: successfulCount.toString() };
              } else if (item.title === "Total Cancel") {
                return { ...item, number: cancelCount.toString() };
              } else if (item.title === "Total Today Pickup") {
                return { ...item, number: todayCount.toString() };
              }
              return item;
            })
          );
        })
        .catch((err) => {
          console.log("Total pickup API error:", err);
          setTotalPickupCount(0);
          setTotalSuccessfulCount(0);
          setTotalCancelCount(0);
          setTotalTodayPickupCount(0);
          setHomeData((prevData) =>
            prevData.map((item) => {
              if (item.title === "Total Pickup") {
                return { ...item, number: "0" };
              } else if (item.title === "Total Successful") {
                return { ...item, number: "0" };
              } else if (item.title === "Total Cancel") {
                return { ...item, number: "0" };
              } else if (item.title === "Total Today Pickup") {
                return { ...item, number: "0" };
              }
              return item;
            })
          );
        });
    }
  }, [apiKey?.dealer_id]);

  // Get total category count using GET_CATEGORY and GET_DEALER_DETAILS_PRICE APIs
  useEffect(() => {
    if (apiKey && apiKey.dealer_id) {
      console.log("Fetching category data for dealer_id:", apiKey.dealer_id);
      
      // Fetch all categories first
      axios
        .get(USER_API_ENDPOINTS.GET_CATEGORY)
        .then((categoryRes) => {
          console.log("Categories API response:", categoryRes.data);
          
          // Then fetch dealer's price details
          axios
            .get(`${USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE}${apiKey.dealer_id}/`)
            .then((priceRes) => {
              console.log("Dealer price details API response:", priceRes.data);
              
              // Get unique category IDs that the dealer has set prices for
              const dealerCategoryIds = [...new Set(priceRes.data.map(item => item.category))];
              console.log("Dealer category IDs:", dealerCategoryIds);
              
              // Count how many categories the dealer has prices for
              const categoryCount = dealerCategoryIds.length;
              console.log("Total categories with prices:", categoryCount);
              
              setTotalCategoryCount(categoryCount);
              
              // Update homeData with category count
              setHomeData((prevData) =>
                prevData.map((item) =>
                  item.title === "Total Category"
                    ? { ...item, number: categoryCount.toString() }
                    : item
                )
              );
            })
            .catch((priceErr) => {
              console.log("Dealer price details API error:", priceErr);
              setTotalCategoryCount(0);
              setHomeData((prevData) =>
                prevData.map((item) =>
                  item.title === "Total Category"
                    ? { ...item, number: "0" }
                    : item
                )
              );
            });
        })
        .catch((categoryErr) => {
          console.log("Categories API error:", categoryErr);
          setTotalCategoryCount(0);
          setHomeData((prevData) =>
            prevData.map((item) =>
              item.title === "Total Category"
                ? { ...item, number: "0" }
                : item
            )
          );
        });
    }
  }, [apiKey?.dealer_id]);

  // Update home data variables
  useEffect(() => {
    const updateHomeData = homeData.map((eachTitle) => {
      if (eachTitle.title === "Total Cancel")
        return {
          ...homeData,
          title: "Total Cancel",
          number: x,
        };
      else if (eachTitle.title === "Total Pickup")
        return {
          ...homeData,
          title: "Total Pickup",
          number: total,
        };
      else if (eachTitle.title === "Total Today Pickup")
        return {
          ...homeData,
          title: "Total Today Pickup",
          number: t,
        };
      else return eachTitle;
    });
    setHomeData(updateHomeData);
  }, []);

  // Get scheduled pickups data
  useEffect(() => {
    if (apiKey && apiKey.id) {
      console.log("Scheduled Pickups API URL:", USER_API_ENDPOINTS.VIEW_SCHEDULE_PICKUP_DEALER_MARKET_PLACE1);
      console.log("Current dealer ID:", apiKey.id);

      axios
        .get(`${USER_API_ENDPOINTS.VIEW_SCHEDULE_PICKUP_DEALER_MARKET_PLACE1}`)
        .then((res) => {
          console.log("Scheduled Pickups API response:", res.data);
          console.log("All dealer IDs in response:", res.data.map(pickup => pickup.dealer_id));
          
          // Filter by dealer_id to get only this dealer's scheduled pickups
          const dealerScheduledPickups = res.data.filter(pickup => {
            console.log(`Comparing pickup.dealer_id (${pickup.dealer_id}) with apiKey.id (${apiKey.dealer_id})`);
            return pickup.dealer_id === parseInt(apiKey.dealer_id);
          });
          
          console.log("Filtered scheduled pickups:", dealerScheduledPickups);
          const scheduledPickupsCount = dealerScheduledPickups.length || 0;
          
          setScheduledPickupsCount(scheduledPickupsCount);
          setScheduledPickupsData(dealerScheduledPickups);

          // Update homeData with scheduled pickups count
          setHomeData((prevData) =>
            prevData.map((item) =>
              item.title === "Scheduled Pickups"
                ? { ...item, number: scheduledPickupsCount.toString() }
                : item
            )
          );
        })
        .catch((err) => {
          console.log("Scheduled Pickups API error:", err);
          setScheduledPickupsCount(0);
          setScheduledPickupsData([]);
          setHomeData((prevData) =>
            prevData.map((item) =>
              item.title === "Scheduled Pickups"
                ? { ...item, number: "0" }
                : item
            )
          );
        });
    }
  }, [apiKey?.id]);

  // Get inquiries data
  useEffect(() => {
    if (apiKey && apiKey.email) {
      console.log("API URL:", USER_API_ENDPOINTS.GET_DEALERS_VIA_EMAIL);

      axios
        .get(`${USER_API_ENDPOINTS.GET_DEALERS_VIA_EMAIL}${apiKey.email}/`)
        .then((res) => {
          console.log("Inquiries API response:", res.data);
          const inquiriesCount = res.data.length || 0;
          setInquiriesCount(inquiriesCount);
          setInquiriesData(res.data); // Store the inquiries data

          // Update homeData with inquiries count
          setHomeData((prevData) =>
            prevData.map((item) =>
              item.title === "Inquiries"
                ? { ...item, number: inquiriesCount.toString() }
                : item
            )
          );
        })
        .catch((err) => {
          console.log("Inquiries API error:", err);
          setInquiriesCount(0);
          setInquiriesData([]); // Clear inquiries data on error
          setHomeData((prevData) =>
            prevData.map((item) =>
              item.title === "Inquiries"
                ? { ...item, number: "0" }
                : item
            )
          );
        });
    }
  }, [apiKey?.email]);

  // Handle inquiries card click
  const handleInquiriesClick = () => {
    if (inquiriesCount > 0) {
      setShowInquiriesModal(true);
    }
  };

  // Handle total pickup card click
  const handleTotalPickupClick = () => {
    history.push('/dealer/pickup');
  };

  // Handle total successful card click
  const handleTotalSuccessfulClick = () => {
    history.push('/dealer/pickup');
  };

  // Handle total cancel card click
  const handleTotalCancelClick = () => {
    history.push('/dealer/pickup');
  };

  // Handle total today pickup card click
  const handleTotalTodayPickupClick = () => {
    history.push('/dealer/pickup');
  };

  // Handle total category card click
  const handleTotalCategoryClick = () => {
    history.push('/dealer/settings/setprice');
  };

  // Handle scheduled pickups card click
  const handleScheduledPickupsClick = () => {
    if (scheduledPickupsCount > 0) {
      setShowScheduledPickupsModal(true);
      setSelectedPickup(null); // Reset selected pickup
    }
  };

  // Handle individual pickup click
  const handlePickupClick = (pickup) => {
    setSelectedPickup(pickup);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedPickup(null);
  };

  const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      <div className="dealer__home similar__section">
        <h1 className="similar__section__heading">Dashboard</h1>

        <div className="dashboard">
          {homeData?.map((eachData, eachDataIndex) => {
            return (
              <DealerHomeCard
                key={eachDataIndex}
                title={eachData.title}
                number={eachData.number}
                onClick={
                  eachData.title === "Inquiries"
                    ? handleInquiriesClick
                    : eachData.title === "Scheduled Pickups"
                    ? handleScheduledPickupsClick
                    : eachData.title === "Total Pickup"
                    ? handleTotalPickupClick
                    : eachData.title === "Total Successful"
                    ? handleTotalSuccessfulClick
                    : eachData.title === "Total Cancel"
                    ? handleTotalCancelClick
                    : eachData.title === "Total Today Pickup"
                    ? handleTotalTodayPickupClick
                    : eachData.title === "Total Category"
                    ? handleTotalCategoryClick
                    : undefined
                }
                isClickable={
                  (eachData.title === "Inquiries" && inquiriesCount > 0) ||
                  (eachData.title === "Scheduled Pickups" && scheduledPickupsCount > 0) ||
                  (eachData.title === "Total Pickup" && totalPickupCount >= 0) || // Always clickable for Total Pickup
                  (eachData.title === "Total Successful" && totalSuccessfulCount >= 0) || // Always clickable for Total Successful
                  (eachData.title === "Total Cancel" && totalCancelCount >= 0) || // Always clickable for Total Cancel
                  (eachData.title === "Total Today Pickup" && totalTodayPickupCount >= 0) || // Always clickable for Total Today Pickup
                  (eachData.title === "Total Category" && totalCategoryCount >= 0) // Always clickable for Total Category
                }
              />
            );
          })}
        </div>
      </div>

      {/* Inquiries Modal */}
      {showInquiriesModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowInquiriesModal(false)}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal__header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Customer Inquiries ({inquiriesCount})</h2>
              <button
                onClick={() => setShowInquiriesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                }}
              >
                ×
              </button>
            </div>
            <div className="inquiries__list">
              {inquiriesData.map((inquiry, index) => (
                <div
                  key={index}
                  className="inquiry__card"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    display: "flex",
                    gap: "15px",
                  }}
                >
                  <div className="inquiry__info" style={{ flex: 1 }}>
                    <h3>{inquiry.customer_name}</h3>
                    <p>
                      <strong>Phone:</strong> {inquiry.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {inquiry.email}
                    </p>
                    <p>
                      <strong>Item:</strong> {inquiry.itemName}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {inquiry.quantity}
                    </p>
                    <p>
                      <strong>Description:</strong> {inquiry.description}
                    </p>
                  </div>
                  {inquiry.itemPic && (
                    <div
                      className="inquiry__image"
                      style={{
                        width: "100px",
                        height: "100px",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={`${apiUrl}${inquiry.itemPic}`}
                        alt={inquiry.itemName}
                        onError={(e) => (e.target.style.display = "none")}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          backgroundColor: "#f9f9f9",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Pickups Modal */}
      {showScheduledPickupsModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowScheduledPickupsModal(false)}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: selectedPickup ? "600px" : "800px" }}
          >
            <div
              className="modal__header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>
                {selectedPickup ? "Pickup Details" : `Scheduled Pickups (${scheduledPickupsCount})`}
              </h2>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {selectedPickup && (
                  <button
                    onClick={handleBackToList}
                    style={{
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ← Back to List
                  </button>
                )}
                <button
                  onClick={() => setShowScheduledPickupsModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "0",
                    width: "30px",
                    height: "30px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            {selectedPickup ? (
              // Detailed view of selected pickup
              <div className="pickup__details">
                <div className="detail__card" style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9"
                }}>
                  <h3 style={{ marginTop: "0", color: "#333" }}>Customer Information</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div>
                      <p><strong>Name:</strong> {selectedPickup.name}</p>
                      <p><strong>Phone:</strong> {selectedPickup.phone_number}</p>
                      <p><strong>Email:</strong> {selectedPickup.email}</p>
                    </div>
                    <div>
                      <p><strong>Pincode:</strong> {selectedPickup.pincode}</p>
                      <p><strong>State & Country:</strong> {selectedPickup.state_n_country}</p>
                    </div>
                  </div>
                  
                  <h4 style={{ color: "#333", marginBottom: "10px" }}>Address</h4>
                  <p style={{ 
                    backgroundColor: "white", 
                    padding: "10px", 
                    border: "1px solid #ddd", 
                    borderRadius: "4px",
                    marginBottom: "20px"
                  }}>
                    {selectedPickup.address}
                  </p>
                  
                  <h4 style={{ color: "#333", marginBottom: "10px" }}>Scheduled Time</h4>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <p><strong>Date:</strong> <span style={{ color: "#007bff" }}>{selectedPickup.select_date}</span></p>
                    <p><strong>Time:</strong> <span style={{ color: "#007bff" }}>{selectedPickup.select_time}</span></p>
                  </div>
                  
                  {selectedPickup.dealer_account_type !== "undefined" && (
                    <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#e7f3ff", borderRadius: "4px" }}>
                      <p><strong>Dealer Type:</strong> {selectedPickup.dealer_account_type}</p>
                      {selectedPickup.deale_name !== "undefined" && (
                        <p><strong>Dealer Name:</strong> {selectedPickup.deale_name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // List view of all scheduled pickups
              <div className="scheduled__pickups__list">
                {scheduledPickupsData.map((pickup, index) => (
                  <div
                    key={pickup.id}
                    className="pickup__card"
                    onClick={() => handlePickupClick(pickup)}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,123,255,0.15)";
                      e.currentTarget.style.borderColor = "#007bff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Header with customer name and status indicator */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "16px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: "0 0 8px 0", 
                          color: "#1a1a1a", 
                          fontSize: "18px",
                          fontWeight: "600"
                        }}>
                          {pickup.name}
                        </h4>
                        <div style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: pickup.select_date >= new Date().toISOString().split('T')[0] ? "#e8f5e8" : "#fff3cd",
                          color: pickup.select_date >= new Date().toISOString().split('T')[0] ? "#2d5a2d" : "#856404",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          border: pickup.select_date >= new Date().toISOString().split('T')[0] ? "1px solid #b8e6b8" : "1px solid #f5d971"
                        }}>
                          {pickup.select_date >= new Date().toISOString().split('T')[0] ? "Upcoming" : "Past Due"}
                        </div>
                      </div>
                      
                      <div style={{ 
                        backgroundColor: "#007bff", 
                        color: "white", 
                        padding: "8px 16px", 
                        borderRadius: "8px", 
                        fontSize: "12px",
                        fontWeight: "500",
                        marginLeft: "16px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span>View Details</span>
                        <span style={{ fontSize: "14px" }}>→</span>
                      </div>
                    </div>

                    {/* Main info grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "16px", 
                      marginBottom: "16px"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px"
                      }}>
                        <span style={{ fontSize: "16px" }}>📞</span>
                        <div>
                          <div style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>PHONE</div>
                          <div style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>{pickup.phone_number}</div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px"
                      }}>
                        <span style={{ fontSize: "16px" }}>📍</span>
                        <div>
                          <div style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>PINCODE</div>
                          <div style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>{pickup.pincode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time highlight */}
                    <div style={{ 
                      display: "flex", 
                      gap: "12px", 
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "8px",
                      border: "1px solid #cce7ff"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "11px", color: "#0066cc", fontWeight: "600", marginBottom: "4px" }}>SCHEDULED DATE</div>
                        <div style={{ fontSize: "16px", color: "#0066cc", fontWeight: "600" }}>
                          {new Date(pickup.select_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "11px", color: "#0066cc", fontWeight: "600", marginBottom: "4px" }}>TIME</div>
                        <div style={{ fontSize: "16px", color: "#0066cc", fontWeight: "600" }}>
                          {new Date(`2000-01-01T${pickup.select_time}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ 
                      padding: "12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      borderLeft: "4px solid #007bff"
                    }}>
                      <div style={{ fontSize: "11px", color: "#666", fontWeight: "600", marginBottom: "6px" }}>ADDRESS</div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: "#333",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {pickup.address}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "4px",
                      height: "100%",
                      backgroundColor: "#007bff",
                      opacity: 0,
                      transition: "opacity 0.3s ease"
                    }} className="hover-indicator" />
                  </div>
                ))}
                
                {scheduledPickupsData.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#666"
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                    <h3 style={{ color: "#999", marginBottom: "8px" }}>No Scheduled Pickups</h3>
                    <p style={{ color: "#bbb", fontSize: "14px" }}>There are currently no scheduled pickups for your account.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default DealerHome;
