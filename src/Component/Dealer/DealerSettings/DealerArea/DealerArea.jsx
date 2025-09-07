import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import DealerAreaCard from "./DealerAreaCard";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";
import Navbar from "../../../Navbar";
// css
import "../../../../Css/DealerArea.css";
import "../../../../App.css";

// dealer area data
import { apiUrl } from "../../../../Private";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const DealerArea = () => {
  const [dealerAreaData, setDealerAreaData] = useState([]);
  const [areaInputData, setAreaInputData] = useState({
    pincode: "",
    state: "",
    city: "",
    area: "",
  });

  const [requestedPinDetails, setRequestedPinDetails] = useState({
    state: "",
    city: "",
    area: "",
  });

  const [priceData, setPriceData] = useState([]);
  const [numberOfPincodesAllowed, setNumberOfPincodesAllowed] = useState(0);
  const [showRequestButton, setShowRequestButton] = useState(false);
  const [requestedPincode, setRequestedPincode] = useState("");
  const [isRequestButtonEnabled, setIsRequestButtonEnabled] = useState(false);
  const requestSectionRef = React.useRef(null);
  const [maxPincodesAllowed, setMaxPincodesAllowed] = useState(10);

  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  let pincodes = [];

  // Function to get max pincodes based on account role
  const getMaxPincodesForRole = (accountRole) => {
    if (!accountRole) return 10; // default
    const role = accountRole.toLowerCase();
    switch (role) {
      case "kabadiwala":
        return 5;
      case "collector":
      case "recycler":
      default:
        return 10;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Set max pincodes based on account role
    const maxAllowed = getMaxPincodesForRole(apiKey?.account_role);
    setMaxPincodesAllowed(maxAllowed);
  }, []);

  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.GET_DEALER_ALL_PINCODES + `${apiKey.dealer_id}/`)
      .then((res) => {
        const pincodes = [];
        for (let x in res.data) {
          if (!isNaN(res.data[x])) pincodes.push(res.data[x]);
        }
        setDealerAreaData(pincodes);
        
        // Check if dealer has reached max pincodes and should show request button
        const maxAllowed = getMaxPincodesForRole(apiKey?.account_role);
        if (pincodes.length >= maxAllowed) {
          setShowRequestButton(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);


  useEffect(() => {
    axios
      .get(
        USER_API_ENDPOINTS.GET_DEALER_ALL_PINCODES + `${apiKey.dealer_id}/`
      )
      .then((res) => {
        pincodes = [];
        for (let x in res.data) {
          if (!isNaN(res.data[x])) pincodes.push(res.data[x]);
        }
        setDealerAreaData(pincodes);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const getInputValue = (e) => {
    setAreaInputData({ ...areaInputData, [e.target.name]: e.target.value });
  };

  const searchArea = async () => {
    if (areaInputData.pincode !== "") {
      await axios
        .get(`https://api.postalpincode.in/pincode/${areaInputData.pincode}`)
        .then((response) => {
          if (response.data[0].PostOffice === null) {
            Swal.fire({
              title: "Check the entered pincode",
              confirmButtonColor: "#56b124",
            });
          } else {
            setAreaInputData({
              ...areaInputData,
              state: response.data[0].PostOffice[0].State,
              city: response.data[0].PostOffice[0].District,
              area: response.data[0].PostOffice[0].Block,
            });
          }
        });
    } else {
      Swal.fire({
        title: "Add a pincode first",
        confirmButtonColor: "#56b124",
      });
    }
  };

  const addArea = () => {
    if (
      areaInputData.pincode !== "" &&
      areaInputData.state !== "" &&
      areaInputData.city !== "" &&
      areaInputData.area !== ""
    ) {
      if (dealerAreaData.includes(areaInputData.pincode)) {
        Swal.fire({
          title: "This pincode has already been added.",
          confirmButtonColor: "#56b124",
        });
        return;
      }

      if (dealerAreaData.length >= maxPincodesAllowed) {
        const roleName = apiKey?.account_role || "dealer";
        Swal.fire({
          title: `You have reached the maximum of ${maxPincodesAllowed} pincodes for ${roleName} role.`,
          text: "Please request admin to add more pincodes.",
          confirmButtonColor: "#d33",
        }).then(() => {
          setAreaInputData({
            pincode: "",
            state: "",
            city: "",
            area: "",
          });
        });
        return;
      }



      const data = new FormData();
      data.append("dealer_id", apiKey["dealer_id"]);

      let i = 0;
      for (; i < dealerAreaData.length; i++) {
        data.append(`pincode${i + 1}`, dealerAreaData[i]);
      }

      data.append(`pincode${i + 1}`, areaInputData.pincode);

      for (let j = i + 2; j <= maxPincodesAllowed; j++) {
        data.append(`pincode${j}`, "");
      }

      setAreaInputData({
        pincode: "",
        state: "",
        city: "",
        area: "",
      });

      axios
        .post(USER_API_ENDPOINTS.UPDATE_PINCODES_DEALER_DETAILS, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (
            res.data["unsuccessful"] ===
            "The dealer is not registered in pincodes table yet"
          ) {
            axios
              .post(USER_API_ENDPOINTS.ADD_PINCODES_DEALER_DETAILS, data, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then(() => {
                Swal.fire({
                  title: "Pincodes added successfully",
                  confirmButtonColor: "#56b124",
                });
                history.push("/dealer/settings");
              })
              .catch((err) => {
                console.log(err);
                Swal.fire({
                  title: "Failed to add area",
                  confirmButtonColor: "#d33",
                });
              });
          } else {
            Swal.fire({
              title: "Area added successfully",
              confirmButtonColor: "#56b124",
            });
            history.push("/dealer/settings");
          }
        })
        .catch((err) => {
          if (
            err.response?.data?.unsuccessful ===
            "This dealer already has a Pincode table created"
          ) {
            Swal.fire({
              title: "This dealer already has a Pincode table created",
              confirmButtonColor: "#56b124",
            });
          } else {
            console.log(err);
            Swal.fire({
              title: "Failed to add area",
              confirmButtonColor: "#d33",
            });
          }
        });
    }
  };

  const deleteArea = async (index) => {
    const dealerId = apiKey["dealer_id"];
    const pincodeToDelete = dealerAreaData[index];

    try {
      // Step 1: Get all subcategories
      const subcategoryRes = await axios.get(USER_API_ENDPOINTS.GET_ALL_SUB_CATEGORY_LIST);
      const subcategories = subcategoryRes.data.map((sub) => sub.id); // Assumes { id, name } structure

      // Step 2: Delete price data for each subcategory
      for (const subcategoryId of subcategories) {
        const payload = {
          dealer: dealerId,
          pincode: pincodeToDelete,
          subcategory: subcategoryId,
        };

        try {
          await axios.post(
            USER_API_ENDPOINTS.DELETE_PRICE_DEALER_DETAILS,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (err) {
          console.warn(`Failed to delete price for subcategory ${subcategoryId}`, err);
          // Optional: You could continue silently or stop with error if preferred
        }
      }

      // Step 3: Update the backend pincode list
      const data = new FormData();
      data.append("dealer_id", dealerId);

      let i, k;
      for (i = 0, k = 0; i < dealerAreaData.length - 1; i++, k++) {
        if (i === index) k++; // skip the one being deleted
        data.append(`pincode${i + 1}`, dealerAreaData[k]);
      }

      for (let j = i + 1; j <= maxPincodesAllowed; j++) {
        data.append(`pincode${j}`, "");
      }

      await axios.post(USER_API_ENDPOINTS.UPDATE_PINCODES_DEALER_DETAILS, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Step 4: Update local state
      const newDealerAreaData = [...dealerAreaData];
      newDealerAreaData.splice(index, 1);
      setDealerAreaData(newDealerAreaData);

      Swal.fire({
        title: "Pincode and related price data deleted successfully",
        confirmButtonColor: "#56b124",
      });

    } catch (err) {
      console.error("Error during deleteArea:", err);
      Swal.fire({
        title: "Something went wrong while deleting",
        confirmButtonColor: "#d33",
      });
    }
  };

  const searchRequestedPincode = async () => {
    const pin = requestedPincode.trim();
    if (pin.length !== 6 || isNaN(pin)) {
      Swal.fire({
        title: "Enter a valid 6-digit pincode",
        confirmButtonColor: "#56b124",
      });
      setIsRequestButtonEnabled(false); // ✅
      return;
    }

    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      const postOffice = res.data[0].PostOffice?.[0];

      if (!postOffice) {
        Swal.fire({
          title: "Invalid pincode. Please check again.",
          confirmButtonColor: "#d33",
        });
        setIsRequestButtonEnabled(false); // ✅
        return;
      }

      setRequestedPinDetails({
        state: postOffice.State,
        city: postOffice.District,
        area: postOffice.Block,
      });

      setIsRequestButtonEnabled(true); // ✅ enable on success
    } catch (err) {
      console.log(err);
      setIsRequestButtonEnabled(false); // ✅
      Swal.fire({
        title: "Failed to fetch pincode details",
        confirmButtonColor: "#d33",
      });
    }
  };


  const requestAddPincode = async () => {
    const pin = requestedPincode.trim();

    if (pin.length !== 6 || isNaN(pin)) {
      Swal.fire({
        title: "Enter a valid 6-digit pincode",
        confirmButtonColor: "#56b124",
      });
      setRequestedPincode("");
      setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
      setIsRequestButtonEnabled(false);
      return;
    }

    if (dealerAreaData.includes(pin)) {
      Swal.fire({
        title: "You have already added this pincode",
        confirmButtonColor: "#56b124",
      });
      setRequestedPincode("");
      setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
      setIsRequestButtonEnabled(false); // ✅
      return;
    }

    try {
      // Step 1: Fetch location info
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      const info = res.data[0]?.PostOffice?.[0];

      if (!info) {
        Swal.fire({
          title: "Invalid pincode. Please check again.",
          confirmButtonColor: "#d33",
        });
        setRequestedPincode("");
        setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
        setIsRequestButtonEnabled(false);
        return;
      }

      // Step 2: Confirm with user
      const confirm = await Swal.fire({
        title: `Confirm to request this pincode?`,
        html: `<strong>Pincode:</strong> ${pin}<br/>
         <strong>State:</strong> ${info.State}<br/>
         <strong>City:</strong> ${info.District}<br/>
         <strong>Area:</strong> ${info.Block}`,
        showCancelButton: true,
        confirmButtonText: "Submit Request",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#56b124",
        cancelButtonColor: "#d33",
      });

      // Step 3: Check if already requested
      const details = await axios.get(
        USER_API_ENDPOINTS.GET_NUMBER_OF_PINCODES_DEALER_DETAILS +
        `${apiKey.dealer_id}/`
      );

      if (details.data.addrequest) {
        Swal.fire({
          title:
            "You have already submitted a request. Please retry after it is processed.",
          confirmButtonColor: "#d33",
        });
        setRequestedPincode("");
        setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
        setIsRequestButtonEnabled(false);
        return;
      }

      // Step 4: Submit request
      await axios.post(USER_API_ENDPOINTS.REQ_TO_ADD_PINCODES_DEALER_DETAILS, {
        dealer_id: apiKey.dealer_id,
        addrequest: pin,
      });

      Swal.fire({
        title: "Request submitted successfully!",
        confirmButtonColor: "#56b124",
      });
      setRequestedPincode("");
      setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
      setIsRequestButtonEnabled(false);
    } catch (err) {
      const message =
        err.response?.data?.["Not Acceptable"] ||
        "Something went wrong. Please try again.";
      Swal.fire({
        title: message,
        confirmButtonColor: "#d33",
      });
      setRequestedPincode("");
      setRequestedPinDetails({ state: "", city: "", area: "" }); // ✅ Clear
      setIsRequestButtonEnabled(false);
      console.log(err);
    }
  };




  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      <div className="dealer__area similar__section">
        <h1 className="similar__section__heading">Set Your Area</h1>
        
        {/* Role-based pincode limit information */}
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6" }}>
          <p style={{ margin: "0", fontSize: "14px", color: "#6c757d" }}>
            <strong>Current Role:</strong> {apiKey?.account_role || "N/A"} | 
            <strong> Maximum Pincodes Allowed:</strong> {maxPincodesAllowed} | 
            <strong> Used:</strong> {dealerAreaData.length}/{maxPincodesAllowed}
          </p>
        </div>

        <div className="area__form" onSubmit={addArea}>
          <input
            type="text"
            required
            placeholder="Enter Your Pincode"
            name="pincode"
            value={areaInputData.pincode}
            onChange={getInputValue}
          />
          <button className="search__area__button" onClick={searchArea}>
            Search
          </button>
          <p>
            State : <span>{areaInputData.state}</span>
          </p>
          <p>
            City : <span>{areaInputData.city}</span>
          </p>
          <p>
            Area : <span>{areaInputData.area}</span>
          </p>
          <button onClick={addArea} className="add__area__button">
            Add Your Area
          </button>
          {areaInputData.state && areaInputData.city && areaInputData.area && (
            <button
              onClick={() =>
                setAreaInputData({ pincode: "", state: "", city: "", area: "" })
              }
              className="cancel__area__button"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "90px",
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#d33",
                color: "#fff",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="add__area">
          <h1>Added Area</h1>
          <div>
            {dealerAreaData.length !== 0 ? (
              dealerAreaData.map((eachData, eachDataIndex) => {
                return (
                  <DealerAreaCard
                    key={eachDataIndex}
                    pincode={eachData}
                    deleteArea={deleteArea.bind(this, eachDataIndex)}
                  />
                );
              })
            ) : (
              <p>No Area available here</p>
            )}
          </div>
        </div>

        {showRequestButton && (
          <div
            ref={requestSectionRef}
            className="area__form"
            style={{ marginTop: "30px" }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              Request to Add More Pincode 
              {apiKey?.account_role && (
                <span style={{ fontSize: "14px", color: "#6c757d" }}>
                  {" "}(As {apiKey.account_role}, you've reached the limit of {maxPincodesAllowed} pincodes)
                </span>
              )}
            </h3>
            <input
              type="text"
              placeholder="Enter extra pincode"
              value={requestedPincode}
              maxLength={6}
              onChange={(e) => {
                setRequestedPincode(e.target.value);
                setIsRequestButtonEnabled(false); // ✅ reset on edit
              }}
              name="requestedPincode"
              required
            />
            <button className="search__area__button" onClick={searchRequestedPincode}>
              Search
            </button>

            <p>State : <span>{requestedPinDetails.state}</span></p>
            <p>City : <span>{requestedPinDetails.city}</span></p>
            <p>Area : <span>{requestedPinDetails.area}</span></p>

            <button
              onClick={requestAddPincode}
              className="add__area__button"
              disabled={!isRequestButtonEnabled} // ✅ final touch
            >
              Request to Add Pincode
            </button>
          </div>
        )}


      </div>

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default DealerArea;
