import React, { useEffect, useState } from "react";
import axios from "axios";

// Component imports
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// CSS
import "../../../Css/UserDealerProfile.css";

// API + helper
import { USER_API_ENDPOINTS } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";

const UserDealerProfile = () => {
  const [qrImageSrc, setQrImageSrc] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchQRCodeAndUserData = async () => {
      try {
        // Read email and account_type from localStorage
        const authData = JSON.parse(localStorage.getItem("KTMauth"));
        setUserData(authData);

        // Fetch QR Code
        const accessToken = await getAccessTokenFromRefresh();
        const response = await axios.get(USER_API_ENDPOINTS.GET_QR, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const base64 = response.data.qr_code;

        if (!base64 || base64.length < 100) {
          console.error("QR code is empty or invalid:", base64);
          return;
        }

        const dataUrl = `data:image/jpeg;base64,${base64}`;
        setQrImageSrc(dataUrl);
      } catch (error) {
        console.error("Error fetching QR code or user data:", error);
      }
    };

    fetchQRCodeAndUserData();
  }, []);

  return (
    <>
      <Navbar />
      <UserProfileSearchbar />
      <UserProfileNavbar />

      <div
        className="qr-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          // border: "2px solid #4CAF50",
          borderRadius: "10px",
          padding: "20px",
          margin: "20px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Your QR Code</h1>

        {userData && (
          <>
            <h3 style={{ fontSize: "18px", margin: "10px 0" }}>{userData.email}</h3>
            <h3 style={{ fontSize: "18px", margin: "10px 0" }}>{userData.account_type}</h3>
          </>
        )}

        {qrImageSrc ? (
          <img
            src={qrImageSrc}
            alt="QR Code"
            style={{
              width: "250px",
              border: "4px solid #4CAF50",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          />
        ) : (
          <p>Loading QR code...</p>
        )}
      </div>

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default UserDealerProfile;
