import Modal from "react-modal";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import { apiUrl, USER_API_ENDPOINTS } from '../../../utils/apis';
import { getAccessTokenFromRefresh } from "../../../utils/helper";

import Navbar from "../../Navbar";
import MainFooter from '../../Footer/MainFooter';
import TermFooter from '../../Footer/TermFooter';
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import UserAddressCard from './DealerAddressCard';

import '../../../Css/UserAddress.css';
import '../../../Css/AddressForm.css';
import '../../../Css/ModernForm.css';

const UserAddress = () => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const [userAddress, setUserAddress] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [areaInputData, setAreaInputData] = useState({
    pincode: "",
    city: "",
    address: "",
    addressarea: "",
    landmark: "",
    state: "",
    country: "",
    digipin_data: "",
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const openModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen && editMode) {
      setEditMode(false);
      setEditingId(null);
      setAreaInputData({
        pincode: "",
        city: "",
        address: "",
        addressarea: "",
        landmark: "",
        state: "",
  country: "",
  digipin_data: ""
      });
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditMode(false);
    setEditingId(null);
    setAreaInputData({
      pincode: "",
      city: "",
      address: "",
      addressarea: "",
      landmark: "",
      state: "",
      country: ""
    });
  };  useEffect(() => {
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

  // Get user location and fetch digipin
  const getUserLocationAndDigipin = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const digipinResponse = await axios.get(`${USER_API_ENDPOINTS.GET_ENCODE}?lat=${lat}&lon=${lon}`);
            const addressResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);

            if (digipinResponse.data && digipinResponse.data.digipin) {
              const addressData = addressResponse.data;
              const displayName = addressData?.display_name || "";
              const addressParts = displayName.split(", ").map(part => part.trim());

              let city = "";
              let state = "";
              let postcode = "";

              if (addressParts.length >= 4) {
                postcode = addressParts[addressParts.length - 2];
                state = addressParts[addressParts.length - 3];
                city = addressParts[addressParts.length - 4];
              }

              if (!city || !state || !postcode) {
                const address = addressData?.address || {};
                city = city || address.city || address.town || address.village || "";
                state = state || address.state || "";
                postcode = postcode || address.postcode || "";
              }

              setAreaInputData(prev => ({
                ...prev,
                digipin_data: digipinResponse.data.digipin,
                pincode: postcode,
                city: city,
                state: state,
              }));

              Swal.fire({
                title: "Location Found!",
                text: `Digipin: ${digipinResponse.data.digipin}`,
                icon: "success",
                confirmButtonColor: "#56b124",
                timer: 2000,
                customClass: {
                  container: 'swal-container-high-z'
                },
                didOpen: () => {
                  const swalContainer = document.querySelector('.swal2-container');
                  if (swalContainer) {
                    swalContainer.style.zIndex = '10000';
                  }
                }
              });
            }
          } catch (error) {
            console.error("Error fetching location data:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to fetch location data. Please try again.",
              icon: "error",
              confirmButtonColor: "#56b124",
              customClass: {
                container: 'swal-container-high-z'
              },
              didOpen: () => {
                const swalContainer = document.querySelector('.swal2-container');
                if (swalContainer) {
                  swalContainer.style.zIndex = '10000';
                }
              }
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
            customClass: {
              container: 'swal-container-high-z'
            },
            didOpen: () => {
              const swalContainer = document.querySelector('.swal2-container');
              if (swalContainer) {
                swalContainer.style.zIndex = '10000';
              }
            }
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
        customClass: {
          container: 'swal-container-high-z'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });
    }
  };

  const addArea = async () => {
    const data = new FormData();
  const { pincode, city, address, addressarea, landmark, state, country, digipin_data } = areaInputData;

    if (
      !isNaN(pincode) &&
      pincode.length === 6 &&
      city && state && landmark && address && addressarea
    ) {
      data.append("add_user", apiKey['id']);
      data.append("add_line1", address);
      data.append("add_line2", addressarea);
      data.append("landmark", landmark);
      data.append("city", city);
      data.append("state", state);
      data.append("zipcode", pincode);
  data.append("country", country);
  data.append("digipin_data", digipin_data || "");
  data.append("default", userAddress.length === 0 ? "default" : "not default");

      try {
        if (userAddress.length <= 4) {
          const accessToken = await getAccessTokenFromRefresh();
          const res = await axios.post(USER_API_ENDPOINTS.GET_ADDRESS, data, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (res.status === 201 && res.data.message === "Address created successfully.") {
            Swal.fire({
              title: "Successfully added area",
              confirmButtonColor: '#56b124',
              customClass: {
                container: 'swal-container-high-z'
              },
              didOpen: () => {
                const swalContainer = document.querySelector('.swal2-container');
                if (swalContainer) {
                  swalContainer.style.zIndex = '10000';
                }
              }
            }).then(() => {
              closeModal();
              fetchUserAddress();
            });
          } else {
            Swal.fire({ title: "Failed to add address", confirmButtonColor: '#d33' });
          }
        } else {
          Swal.fire({
            title: "You can add only 5 addresses.",
            confirmButtonColor: '#56b124',
            customClass: {
              container: 'swal-container-high-z'
            },
            didOpen: () => {
              const swalContainer = document.querySelector('.swal2-container');
              if (swalContainer) {
                swalContainer.style.zIndex = '10000';
              }
            }
          }).then(() => closeModal());
        }
      } catch (err) {
        console.error("❌ Error adding address:", err);
      }
    } else {
      Swal.fire({
        title: "Enter valid fields. All fields are mandatory.",
        confirmButtonColor: '#56b124',
      });
    }
  };const deleteArea = async (id) => {
  try {
    const accessToken = await getAccessTokenFromRefresh();
    const res = await axios.delete(`${USER_API_ENDPOINTS.DELETE_ADDRESS}${id}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.status === 202 || res.status === 204 || (res.data && res.data.message === "Address deleted successfully.")) {
      Swal.fire({
        title: "Successfully deleted address",
        confirmButtonColor: "#56b124"
      }).then(() => fetchUserAddress());
    } else {
      Swal.fire({ title: "Failed to delete address", confirmButtonColor: '#d33' });
    }
  } catch (err) {
    console.error("❌ Error deleting address:", err);
    Swal.fire({ title: "Failed to delete address", confirmButtonColor: '#d33' });
  }
};


  const updateArea = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      const payload = {
        add_line1: areaInputData.address,
        add_line2: areaInputData.addressarea,
        landmark: areaInputData.landmark,
        city: areaInputData.city,
        state: areaInputData.state,
        country: areaInputData.country,
        zipcode: parseInt(areaInputData.pincode),
        digipin_data: areaInputData.digipin_data || ""
      };

      const res = await axios.put(`${USER_API_ENDPOINTS.UPDATE_ADDRESS}${editingId}/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.status === 200) {
        await Swal.fire({
          title: "Address updated successfully",
          confirmButtonColor: "#56b124",
          customClass: {
            container: 'swal-container-high-z'
          },
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
          }
        });

        closeModal();
        fetchUserAddress();
      }
    } catch (err) {
      console.error("❌ Error updating address:", err);
    }
  };  const handleEdit = (data) => {
    setEditMode(true);
    setEditingId(data.id);
    setAreaInputData({
      pincode: data.zipcode.toString(),
      city: data.city,
      address: data.add_line1,
      addressarea: data.add_line2,
      landmark: data.landmark,
      state: data.state,
      country: data.country,
      digipin_data: data.digipin_data || ""
    });
    setIsOpen(true);
  };

  const getInputValue = (e) => {
    setAreaInputData({ ...areaInputData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      <div className="similar__section">
        <h1 className="similar__section__heading">Set Your Addresses</h1>
        <div className="address_cards">
          <div className="add__address__card" onClick={() => {
            setEditMode(false);
            setAreaInputData({
              pincode: "",
              city: "",
              address: "",
              addressarea: "",
              landmark: "",
              state: "",
              country: "",
              digipin_data: ""
            });
            openModal();
          }}>
            <span>&#43;</span>
            <p>Add Address</p>
          </div>

          {userAddress.length !== 0 ? (
            userAddress.map((eachData, index) => (
              <UserAddressCard
                key={index}
                pincode={eachData.zipcode}
                address_id={eachData.id}
                state={eachData.state}
                city={eachData.city}
                area={eachData.add_line1}
                address_area={eachData.add_line2}
                country={eachData.country}
                landmark={eachData.landmark}
                digipin_data={eachData.digipin_data}
                default={eachData.default}
                deleteArea={() => deleteArea(eachData.id)}
                updateArea={() => handleEdit(eachData)}
              />
            ))
          ) : (
            <p>No Addresses available here</p>
          )}
        </div>
      </div>

      <Modal
        className="address__modal__content"
        overlayClassName="address__modal__overlay"
        isOpen={isOpen}
        ariaHideApp={false}
      >
        <h1 className="address__form__title">{editMode ? "Update Address" : "Set Address"}</h1>
        
        <div className="address__form__row">
          <input 
            type="text" 
            placeholder="Enter Pincode" 
            name="pincode" 
            value={areaInputData.pincode} 
            onChange={getInputValue} 
            className="address__form__input address__form__input--half"
            required 
          />
          <input 
            type="text" 
            placeholder="Enter City" 
            name="city" 
            value={areaInputData.city} 
            onChange={getInputValue} 
            className="address__form__input address__form__input--half"
            required 
          />
        </div>

        <input 
          type="text" 
          placeholder="Enter Address" 
          name="address" 
          value={areaInputData.address} 
          onChange={getInputValue} 
          className="address__form__input"
          required 
        />
        <input 
          type="text" 
          placeholder="Enter Address Area" 
          name="addressarea" 
          value={areaInputData.addressarea} 
          onChange={getInputValue} 
          className="address__form__input"
          required 
        />
        <input 
          type="text" 
          placeholder="Enter Landmark" 
          name="landmark" 
          value={areaInputData.landmark} 
          onChange={getInputValue} 
          className="address__form__input"
          required 
        />
        
  {/* Digipin Field with Location Button */}
  <div className="digipin-input-wrapper" style={{ marginBottom: "1px" }}>
          <input
            type="text"
            placeholder="Enter Digipin (Optional)"
            name="digipin_data"
            value={areaInputData.digipin_data}
            onChange={getInputValue}
            className="address__form__input"
            style={{ paddingRight: "50px" }}
          />
          <button
            type="button"
            onClick={getUserLocationAndDigipin}
            className={`digipin-locate-btn ${locationLoading ? 'loading' : ''}`}
            disabled={locationLoading}
            title="Auto Detect Location"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #56b124 0%, #4a9c1f 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: locationLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(86, 177, 36, 0.2)",
              zIndex: 2
            }}
          >
            {locationLoading ? (
              <div className="spinner" style={{
                width: "14px",
                height: "14px",
                border: "2px solid #ffffff",
                borderRadius: "50%",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite"
              }}></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>

        <div className="address__form__row">
          <input 
            type="text" 
            placeholder="Enter State" 
            name="state" 
            value={areaInputData.state} 
            onChange={getInputValue} 
            className="address__form__input address__form__input--half"
            required 
          />
          <input 
            type="text" 
            placeholder="Enter Country" 
            name="country" 
            value={areaInputData.country} 
            onChange={getInputValue} 
            className="address__form__input address__form__input--half"
            required 
          />
        </div>

        <div className="address__form__buttons">
          <button 
            onClick={closeModal} 
            className="address__form__button address__form__button--cancel"
          >
            Cancel
          </button>
          {editMode ? (
            <button 
              onClick={updateArea} 
              className="address__form__button"
            >
              Update Address
            </button>
          ) : (
            <button 
              onClick={addArea} 
              className="address__form__button"
            >
              Submit
            </button>
          )}
        </div>
      </Modal>      <MainFooter />
      <TermFooter />
    </>
  );
};

export default UserAddress;
