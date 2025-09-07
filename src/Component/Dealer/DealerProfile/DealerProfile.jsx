import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";

// CSS
import "../../../Css/UserDealerProfile.css";

// Components
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// Material Icons
import DescriptionIcon from '@mui/icons-material/Description';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SettingsIcon from '@mui/icons-material/Settings';

// Default profile image
import defaultProfileImg from "../../../Image/customer__profile__img.PNG";

// API URL + helper
import { apiUrl } from "../../../Private";
import { getAccessTokenFromRefresh } from "../../../utils/helper";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const DealerProfile = () => {
  const [dealerData, setDealerData] = useState(null);
  const [profilePicURL, setProfilePicURL] = useState("");
  const [hasCustomPic, setHasCustomPic] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const localAuth = JSON.parse(localStorage.getItem("KTMauth"));
    if (localAuth) {
      setDealerData(localAuth);
    }

    const fetchProfilePic = async () => {
      try {
        const accessToken = await getAccessTokenFromRefresh();
        if (!accessToken) throw new Error("Access token not found!");

        const response = await axios.get(USER_API_ENDPOINTS.GET_DEALER_PROFILE, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const profileData = response.data;
        const pic = profileData?.ProfilePic;
        if (pic && pic !== "") {
          const fullURL = pic.startsWith("http") ? pic : `${apiUrl}${pic}`;
          setProfilePicURL(fullURL);
          setHasCustomPic(true);
        } else {
          setHasCustomPic(false);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        setHasCustomPic(false);
      }
    };

    fetchProfilePic();
  }, []);

  if (!dealerData) return <p className="loading">Loading...</p>;

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />
      <DealerProfileNavbar />

      <div className="user__dealer__profile">
        <div className="left__side">
          <img
            src={hasCustomPic ? profilePicURL : defaultProfileImg}
            alt="Dealer Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProfileImg;
              setHasCustomPic(false);
            }}
          />
          <NavLink className="user__dealer__profile__edit__link" to="/dealer/profile/profileedit">
            Edit
          </NavLink>
        </div>

        <div className="right__side">
          <p>Email ID : <span>{dealerData.email || "N/A"}</span></p>
          <p>Mobile Number : <span>{dealerData.phone_number || "N/A"}</span></p>
          <p>Account Type : <span>{dealerData.account_type || "N/A"}</span></p>
          <p>
            Address: <Link to="/dealer/address" className="view__address">View your address</Link>
          </p>

          <div className="document__qr">
            <NavLink className="user__dealer__profile__document__qr__link" to="/dealer/settings">
              <SettingsIcon />
              Settings
            </NavLink>
            <NavLink className="user__dealer__profile__document__qr__link" to="/dealer/profile/qr">
              <CropFreeIcon />
              QR Code
            </NavLink>
          </div>
        </div>
      </div>

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default DealerProfile;
