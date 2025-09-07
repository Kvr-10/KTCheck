import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";

// component
import Navbar from "../Navbar";
import SellFaqTopBanner from "../SellFaqTopBanner";
import UserProfileSearchbar from "../UserProfileSearchbar";
import ChangePincode from "../ChangePincode";
import SellCard from "./SellCard";
import MainFooter from "../../Component/Footer/MainFooter";
import TermFooter from "../../Component/Footer/TermFooter";

// css
import "../../Css/Sell.css";
import "../../App.css";
// images
import RateOfScraps from "../../Images/Rate_of_scraps.png";

//material ui
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// api url
import { apiUrl } from "../../utils/apis";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const Sell = () => {
  const history = useHistory();
  const [scrapCategoryData, setScrapCategoryData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [happyCustomer, setHappyCustomer] = useState([]);

  const [modalPincode, setModalPincode] = useState("");
  const [pincodeData, setPincodeData] = useState(undefined);
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const gAuth = localStorage.getItem("KTMgauth");
  const pincode = localStorage.getItem("KTMpincode");
  const [userData, setUserData] = useState({ area_pin: pincode ? pincode : "Select", type: "" });



  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // open modal
  const openModal = () => {
    setIsOpen(!isOpen);
  };


  // save pincode to local storage
  useEffect(() => {
    if (userData.area_pin !== "") {
      localStorage.setItem("KTMpincode", userData.area_pin);
    }
  }, [userData.area_pin]);

  // change pincode
  const changePincode = async () => {
    if (modalPincode !== "") {
      axios
        .get(`https://api.postalpincode.in/pincode/${modalPincode}`)
        .then((res) => {
          if (res.data[0].Status === "Success") {
            setUserData({ ...userData, area_pin: modalPincode });
            setPincodeData(res.data); // <-- set pincode data here
            setModalPincode("");
            setIsOpen(!isOpen);
          } else {
            setModalPincode("");
            setIsOpen(!isOpen);
            setPincodeData(undefined);
            Swal.fire({
              title: "Invalid pincode",
              confirmButtonColor: "#56b124",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // Optionally, fetch pincode data on mount if area_pin is already set
  useEffect(() => {
    if (userData.area_pin && userData.area_pin !== "Select") {
      axios
        .get(`https://api.postalpincode.in/pincode/${userData.area_pin}`)
        .then((res) => {
          if (res.data[0].Status === "Success") {
            setPincodeData(res.data);
          } else {
            setPincodeData(undefined);
          }
        })
        .catch(() => setPincodeData(undefined));
    }
  }, [userData.area_pin]);

  // get sell category data
  useEffect(() => {
    axios
      // .get(`${apiUrl}/store/get-categories/`)
      .get(USER_API_ENDPOINTS.GET_CATEGORY)
      .then((res) => {
        console.log(res.data);
        setScrapCategoryData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    try {
      const res = await fetch(`${apiUrl}/cat/category-list/`, {
        method: 'GET'
      })
      const data = await res.json();

      console.log(data);

    }
    catch (err) {
      console.log(err);
    }
  }

  // get happy customer data
  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.GET_HAPPY_CUSTOMERS)
      .then((response) => {
        setHappyCustomer(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="main__section">
          <>
            <img src={RateOfScraps} alt="Rate of scraps" style={{ width: '100%', height: 'auto', marginTop: '2px' }} />
          </>

        <ChangePincode
          pincode={
            userData.area_pin !== ""
              ? userData.area_pin
              : pincode
                ? pincode
                : "Select"
          }
          openModal={openModal}
        />

        {/* Show selected area info if pincodeData is available */}
        {pincodeData !== undefined && pincodeData[0].PostOffice && (
          <div 
            className="sell__item__area"
            style={{
              paddingLeft: window.innerWidth <= 768 ? '16px' : '0px'
            }}
          >
            <p>
              Selected area :{" "}
              <span>
                {pincodeData[0].PostOffice[0].Block},{" "}
                {pincodeData[0].PostOffice[0].District},{" "}
                {pincodeData[0].PostOffice[0].State} -{" "}
                {pincodeData[0].PostOffice[0].Pincode}
              </span>
            </p>
          </div>
        )}

        <div className="scrap__section" id="sellyourscrap">
          {scrapCategoryData.map((eachData) => (
            <SellCard
              key={eachData.id}
              pic={eachData.image}
              title={eachData.name}
              onClick={() => {
                if (
                  userData.area_pin === "" ||
                  userData.area_pin === "Select" ||
                  !userData.area_pin
                ) {
                  Swal.fire({
                    title: "Please choose a pincode first",
                    icon: "warning",
                    confirmButtonColor: "#56b124",
                  });
                  return;
                }

                localStorage.setItem("KTMsellItemName", eachData.name.toLowerCase());
                history.push("/sell/sellitem");
              }}
            />
          ))}
        </div>

        {/* customers happy section */}
        <div className="main__section__carousel">
          <h1>Our Happy Customers</h1>
          {happyCustomer.length !== 0 ? (
            <div className="carousel__section">
              <Splide
                className="main__carousel"
                options={{
                  type: "loop",
                  gap: "1rem",
                  autoplay: true,
                  pauseOnHover: false,
                  resetProgress: false,
                  pagination: false,
                  arrows: false,
                }}
              >
                {happyCustomer.map((eachDetails, eachDetailsIndex) => {
                  return (
                    <SplideSlide key={eachDetailsIndex} className="carousel">
                      <div className="team-member-card sidewise">
                        <img src={eachDetails.dp} alt="" className="team-member-img" />
                        <div className="team-member-info">
                          <h2>{eachDetails.feedback}</h2>
                          <p>{eachDetails.name}</p>
                        </div>
                      </div>
                    </SplideSlide>
                  );
                })}
              </Splide>
            </div>
          ) : null}
        </div>

        <Modal
          isOpen={isOpen}
          ariaHideApp={false}
          style={{
            overlay: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            },
            content: {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              right: 'auto',
              bottom: 'auto',
              border: 'none',
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              margin: 0,
              transform: 'none',
              inset: 'auto'
            }
          }}
        >
          <CloseRoundedIcon
            fontSize="large"
            onClick={openModal}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              cursor: 'pointer',
              color: '#999',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              padding: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.color = '#999';
            }}
          />
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#333', 
              marginBottom: '8px',
              margin: 0 
            }}>
              Change Area Pincode
            </h1>
            <p style={{ 
              color: '#666', 
              fontSize: '14px', 
              margin: '8px 0 0 0' 
            }}>
              Enter your pincode to find nearby dealers
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#333' 
            }}>
              Pincode
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit pincode"
              value={modalPincode}
              maxLength="6"
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '');
                setModalPincode(value);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#56b124';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
              }}
            />
          </div>

          {apiKey === null && gAuth === null && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#333' 
              }}>
                Customer Type
              </label>
              <input
                type="text"
                disabled
                value="Guest User"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  fontSize: '16px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={changePincode}
              disabled={modalPincode.length !== 6}
              style={{
                backgroundColor: modalPincode.length === 6 ? '#56b124' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: modalPincode.length === 6 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: modalPincode.length === 6 ? '0 4px 12px rgba(86, 177, 36, 0.3)' : 'none',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (modalPincode.length === 6) {
                  e.target.style.backgroundColor = '#4a9e1f';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (modalPincode.length === 6) {
                  e.target.style.backgroundColor = '#56b124';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {modalPincode.length === 6 ? 'Done' : `${modalPincode.length}/6`}
            </button>
          </div>
        </Modal>
      </div>

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default Sell;
