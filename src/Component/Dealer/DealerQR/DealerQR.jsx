import React, { useState, useEffect } from "react";
import axios from "axios";

// component
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// css
import "../../../Css/UserDealerQR.css";
import "../../../App.css";

// api & qr url
import Navbar from "../../Navbar";
import { apiUrl } from "../../../Private";
import { getAccessTokenFromRefresh } from "../../../utils/helper";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const DealerQR = () => {
  const [dealerData, setDealerData] = useState();
  const [qrImageSrc, setQrImageSrc] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchDealerData = async () => {
      try {
        const accessToken = await getAccessTokenFromRefresh();
        if (!accessToken) throw new Error("Token not found!");

        // Get dealer profile
        const response = await axios.get(USER_API_ENDPOINTS.GET_DEALER_PROFILE, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const authData = JSON.parse(localStorage.getItem("KTMauth"));
        const updatedAuthData = { ...authData, dealer_id: response.data.id };
        localStorage.setItem("KTMauth", JSON.stringify(updatedAuthData));

        setDealerData({ ...authData, ...response.data });

        // Get QR Code (base64)
        const qrResponse = await axios.get(USER_API_ENDPOINTS.GET_QR, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const base64 = qrResponse?.data?.qr_code;

        if (base64 && base64.length > 100) {
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          setQrImageSrc(dataUrl);
        } else {
          console.warn("Invalid or empty QR base64");
        }

      } catch (error) {
        console.error("Error fetching dealer data or QR code:", error);
      }
    };

    fetchDealerData();
  }, []);

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      {dealerData ? (
        <div className="user__dealer__qr__section similar__section">
          <h1 className="similar__section__heading">Your QR Code</h1>
          <h1>{dealerData.email}</h1>
          <h1>{dealerData.username}</h1>
          <h1>{dealerData.account_type}</h1>

          <div className="user__dealer__qr">
            {qrImageSrc ? (
              <img src={qrImageSrc} alt="QR Code" />
            ) : (
              <p>Loading QR code...</p>
            )}
          </div>
        </div>
      ) : null}

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default DealerQR;
