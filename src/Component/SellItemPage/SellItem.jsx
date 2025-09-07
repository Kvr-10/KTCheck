import React, { useEffect, useState } from "react";
import axios from "axios";
import { TailSpin } from "react-loader-spinner"; // Using TailSpin instead of InfinitySpin
import Swal from "sweetalert2"; // Add this import

// css
import "../../Css/SellItem.css";
import "../../App.css";

// component
import Navbar from "../Navbar";
import UserProfileSearchbar from "../UserProfileSearchbar";
import SellItemCard from "./SellItemCard";
import DealerContactCard from "./DealerContactCard";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";

// material ui component
import { Button, Menu, MenuItem } from "@mui/material";

// material icon
import TuneIcon from '@mui/icons-material/Tune';

// api url
import { USER_API_ENDPOINTS } from "../../utils/apis";

const SellItem = () => {
  const [pincodeData, setPincodeData] = useState();
  const [sellItemData, setSellItemData] = useState([]);
  const [dealerContactData, setDealerContactData] = useState([]);
  const [dealerLoading, setDealerLoading] = useState(false); // Add loading state
  const [sellItemLoading, setSellItemLoading] = useState(false); // Add loading state for sell items
  const [fetchedCartItems, setFetchedCartItems] = useState([]);
  const [apiHealthy, setApiHealthy] = useState(true); // Track API health
  const apiKey = localStorage.getItem("KTMauth") ? JSON.parse(localStorage.getItem("KTMauth")) : null;
  const gAuth = localStorage.getItem("KTMgauth");
  // Always default filter to "all" on reload
  const [sellItemName, setSellItemName] = useState(() => {
    localStorage.setItem("KTMsellItemName", "all");
    return "all";
  });
  const pincode = localStorage.getItem("KTMpincode");

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync sellItemName with localStorage changes (for filter)
  useEffect(() => {
    const stored = localStorage.getItem("KTMsellItemName");
    if (stored !== sellItemName) {
      setSellItemName(stored || "all");
    }
  }, []);

  //get subcategory sell item data
  useEffect(() => {
    if (!pincode || pincode === "Select") {
      setSellItemData([]);
      setSellItemLoading(false);
      return;
    }
    
    setSellItemLoading(true); // Start loading
    
    if (sellItemName === "all") {
      axios.get(USER_API_ENDPOINTS.GET_SUB_CATEGORY_DEALER_DETAILS + `/${pincode}`)
        .then((res) => {
          // console.log("Subcategory via pincode (200):", res.data);
          setSellItemData(Array.isArray(res.data) ? res.data : []);
          setSellItemLoading(false); // Stop loading
        })
        .catch((err) => {
          console.error("Error fetching subcategory data:", err);
          if (err.response?.status === 502 || err.code === 'ERR_BAD_RESPONSE') {
            setApiHealthy(false);
          }
          if (err.response) {
            // console.log("Subcategory via pincode (non-200):", err.response.data);
            setSellItemData(Array.isArray(err.response.data) ? err.response.data : []);
          } else {
            setSellItemData([]);
          }
          setSellItemLoading(false); // Stop loading on error
        });
    } else {
      axios.get(USER_API_ENDPOINTS.GET_SUB_CATEGORY_DEALER_DETAILS + `/${pincode}`)
        .then((res) => {
          // Filter subcategories by selected category name
          const filtered = Array.isArray(res.data) ? res.data.filter(
            item => item.category_name && item.category_name.toLowerCase() === sellItemName
          ) : [];
          setSellItemData(filtered);
          setSellItemLoading(false); // Stop loading
        })
        .catch((err) => {
          console.error("Error fetching filtered subcategory data:", err);
          if (err.response?.status === 502 || err.code === 'ERR_BAD_RESPONSE') {
            setApiHealthy(false);
          }
          setSellItemData([]);
          setSellItemLoading(false); // Stop loading on error
        });
    }
  }, [pincode, sellItemName]);

  // get pincode data
  useEffect(() => {
    if (!pincode || pincode === "Select") {
      setPincodeData(undefined);
      return;
    }
    
    axios
      .get(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => {
        if (res.data && res.data[0] && (res.data[0].PostOffice === null || res.data[0].Status === '404')) {
          Swal.fire({
            title: "Enter valid pincode",
            confirmButtonColor: "#56b124"
          });
          setPincodeData(undefined);
        } else if (res.data && res.data[0] && res.data[0].PostOffice) {
          setPincodeData(res.data);
        } else {
          setPincodeData(undefined);
        }
      })
      .catch((err) => {
        console.error("Error fetching pincode data:", err);
        setPincodeData(undefined);
      });
  }, [pincode]);

  // get dealer contact data
  useEffect(() => {
    setDealerLoading(true); // Start loading
    if (pincode && pincode !== "Select") {
      axios.get(USER_API_ENDPOINTS.GET_DEALERS_VIA_PINCODE + `${pincode}`)
        .then((res) => {
          if (res.status === 200 && res.data && res.data.data) {
            setDealerContactData(Array.isArray(res.data.data['dealers']) ? res.data.data['dealers'] : []);
          } else {
            setDealerContactData([]);
          }
          setDealerLoading(false); // Stop loading
        })
        .catch((err) => {
          console.error("Error fetching dealer contact data:", err);
          if (err.response?.status === 502 || err.code === 'ERR_BAD_RESPONSE') {
            setApiHealthy(false);
          }
          setDealerContactData([]);
          setDealerLoading(false); // Stop loading on error
        });
    } else {
      axios.get(USER_API_ENDPOINTS.DISPLAY_ALL_DEALERS)
        .then((res) => {
          if (res.status === 200) {
            setDealerContactData(res.data.data.dealers || []);
          }
          setDealerLoading(false); // Stop loading
        })
        .catch((err) => {
          console.error("Error fetching all dealers:", err);
          if (err.response?.status === 502 || err.code === 'ERR_BAD_RESPONSE') {
            setApiHealthy(false);
          }
          setDealerContactData([]);
          setDealerLoading(false); // Stop loading on error
        });
    }
  }, [pincode]);

  // ---------- filter menu state & function and filter items ----------
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const filter = (category) => {
    const lowerCaseCategory = category.toLowerCase();
    localStorage.setItem("KTMsellItemName", lowerCaseCategory);
    setSellItemName(lowerCaseCategory);
    setAnchorEl(null);

    // console.log("Selected filter:", lowerCaseCategory);
    // console.log("Current pincode:", pincode);

    if (!pincode || pincode === "Select") {
      setSellItemData([]);
      return;
    }

    setSellItemLoading(true); // Start loading

    axios.get(USER_API_ENDPOINTS.GET_SUB_CATEGORY_DEALER_DETAILS + `/${pincode}`)
      .then((res) => {
        // console.log("API response for filter:", res.data); // <-- log API response
        const items = res.data.filter(item => item.id); // filter out invalid entries

        if (lowerCaseCategory === "all") {
          setSellItemData(items);
        } else {
          const filtered = items.filter(
            item =>
              item.category_name &&
              item.category_name.toLowerCase() === lowerCaseCategory
          );
          setSellItemData(filtered);
        }
        setSellItemLoading(false); // Stop loading
      })
      .catch((err) => {
        // console.log("API error for filter:", err); // <-- log API error
        setSellItemData([]);
        setSellItemLoading(false); // Stop loading on error
      });
  };

  useEffect(() => {
    if (apiKey && apiKey.customer_id) {
      axios.get(`${USER_API_ENDPOINTS.VIEW_CART}${apiKey.customer_id}/`)
        .then((res) => {
          const cartItems = res.data.slice(0, -1); // ignore summary at the end
          setFetchedCartItems(cartItems);
        })
        .catch((err) => {
          // console.error("Error fetching cart items:", err);
        });
    }
  }, []);

  // Check if current user is a dealer
  const isDealer = apiKey && apiKey.dealer_id;
  
  // Debug logging
  // console.log("API Key:", apiKey);
  // console.log("Is Dealer:", isDealer);
  // console.log("Customer ID:", apiKey?.customer_id);
  // console.log("Dealer ID:", apiKey?.dealer_id);
  // -------------------------------------------------------------------

  // Timer to stop spinner after 5 seconds if loading
  useEffect(() => {
    if (sellItemLoading || dealerLoading) {
      const timer = setTimeout(() => {
        setSellItemLoading(false);
        setDealerLoading(false);
      }, 12000); // 12-second timer

      return () => clearTimeout(timer); // Cleanup timer on unmount or dependency change
    }
  }, [sellItemLoading, dealerLoading]);

  return (
    <>
      <Navbar />

      {apiKey !== null || gAuth !== null ? <UserProfileSearchbar /> : null}

      {!apiHealthy && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '15px',
          margin: '10px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <strong>⚠️ Service Notice:</strong> Our backend services are currently experiencing technical difficulties. 
          Some features may not be available. We're working to restore full functionality.
        </div>
      )}

      <div className="sell__item__section">
        <div className="sell__item__header">
          {(() => {
            // Show "Searching" when any loading is happening
            if (sellItemLoading || dealerLoading) {
              return <h1>Searching...</h1>;
            }
            
            if (Array.isArray(sellItemData) && sellItemData.length > 0 && sellItemData[0]?.id > 0) {
              const categoryName = sellItemName && sellItemName !== "all" 
                ? sellItemName[0].toUpperCase() + sellItemName.slice(1).toLowerCase()
                : "All";
              return (
                <h1>
                  {categoryName} Category
                </h1>
              );
            } else if (Array.isArray(dealerContactData) && dealerContactData.length !== 0) {
              return <h1>Dealer Contact Details</h1>;
            } else {
              return <h1>No Service</h1>;
            }
          })()}

          {pincodeData && pincodeData[0] && pincodeData[0].PostOffice && pincodeData[0].PostOffice[0] && (
            <div className="sell__item__area">
              <p>
                Selected area :{" "}
                <span>
                  {pincodeData[0].PostOffice[0].Block}, {pincodeData[0].PostOffice[0].District}, {pincodeData[0].PostOffice[0].State} - {pincodeData[0].PostOffice[0].Pincode}
                </span>
              </p>
            </div>
          )}

          <div className="filter">
            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              style={{ color: "#56b124" }}
              onClick={handleClick}
            >
              Filter
              <TuneIcon />
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
            >
              <MenuItem onClick={filter.bind(this, "all")}>All</MenuItem>
              <MenuItem onClick={filter.bind(this, "paper")}>Paper</MenuItem>
              <MenuItem onClick={filter.bind(this, "glass")}>Glass</MenuItem>
              <MenuItem onClick={filter.bind(this, "plastic")}>Plastic</MenuItem>
              <MenuItem onClick={filter.bind(this, "metals")}>Metal</MenuItem>
              <MenuItem onClick={filter.bind(this, "e-waste")}>E-waste</MenuItem>
              <MenuItem onClick={filter.bind(this, "other")}>Other</MenuItem>
            </Menu>
          </div>
        </div>

        {(() => {
          // Show loading spinner when either sell items or dealers are loading
          if (sellItemLoading || dealerLoading) {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "40vh",
                  width: "100%",
                }}
              >
                <TailSpin
                  height="40"
                  width="40"
                  color="#56b124"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
                <p style={{ marginTop: "20px", color: "#56b124", fontWeight: "bold" }}>
                  {sellItemLoading ? "Loading categories..." : "Loading dealer contacts..."}
                </p>
              </div>
            );
          }

          // Render subcategories if any data is present
          const validSellItems = Array.isArray(sellItemData) ? sellItemData.filter(item => item.subcategory_name) : [];

          if (validSellItems.length > 0) {
            return (
              <div className="sell__item">
                {validSellItems.map((eachItem, index) => (
                  <SellItemCard
                    key={index}
                    price_id={eachItem.id}
                    subcategory_id={eachItem.subcategory}
                    img={eachItem.subcategory_image}
                    name={eachItem.subcategory_name}
                    price={eachItem.price}
                    dealer={eachItem.dealer}
                    pincode={eachItem.pincode}
                    unit={eachItem.unit}
                    gst={eachItem.GST}
                    percentage={eachItem.percentage}
                    fetchedCartItems={fetchedCartItems}
                    onItemAddToCart={(newItem) => setFetchedCartItems(prev => [...prev, newItem])}
                    isDealer={isDealer}
                  />
                ))}
              </div>
            );
          } else if (Array.isArray(dealerContactData) && dealerContactData.length !== 0) {
            return (
              <div className="dealer__contact__section">
                {dealerContactData.map((eachItem) => (
                  <DealerContactCard
                    key={eachItem.id}
                    dealerId={eachItem.id}
                    Name={eachItem.name}
                    Contact={eachItem.mobile}
                    Dealing={eachItem.dealing_in}
                    Minimum={eachItem.min_qty}
                    Maximum={eachItem.max_qty}
                  />
                ))}
              </div>
            );
          } else {
            return (
              <p className="no__service">
                This service is not available in your area.
                <br />
                <span style={{ color: "#56b124", fontWeight: "bold" }}>
                  It will be coming soon.
                </span>
              </p>
            );
          }
        })()}

      </div>
      <MainFooter />
      <TermFooter />
    </>
  );
};

export default SellItem;
