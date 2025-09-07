import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";

// css
import "../../../Css/UserDealerProfile.css";

// component
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// image
import customer__profile__img from "../../../Image/customer__profile__img.PNG";

// api url
import { apiUrl } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(customer__profile__img);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) throw new Error("token not found!");

      const response = await axios.get(USER_API_ENDPOINTS.GET_CUSTOMER_PROFILE, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const authData = JSON.parse(localStorage.getItem("KTMauth"));
      const updatedUserData = { ...authData, ...response.data };
      setUserData(updatedUserData);

      // Set profile image with proper fallback
      const profilePic = response.data?.ProfilePic;
      if (profilePic && profilePic !== "") {
        const fullURL = profilePic.startsWith("http") ? profilePic : `${apiUrl}${profilePic}`;
        setProfileImage(fullURL);
      } else {
        setProfileImage(customer__profile__img);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setProfileImage(customer__profile__img); // fallback on error
    }
  };

  // get user data
  useEffect(() => {
    fetchUserData();
  }, []); // Run only once on mount

  return (
    <>
      <Navbar />
      <UserProfileSearchbar />
      <UserProfileNavbar />

      {userData ? (
        <div className="user__dealer__profile">
          <div className="left__side">
            <img
              src={profileImage || customer__profile__img}
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = customer__profile__img;
              }}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />
            <NavLink className="user__dealer__profile__edit__link" to="/sell/user/profile/profileedit">
              Edit
            </NavLink>
          </div>

          <div className="right__side">
            <p>
              Email ID : <span>{userData?.email}</span>
            </p>
            <p>
              Mobile Number : <span>{userData?.phone_number}</span>
            </p>
            <p>
              Account Type : <span>{userData?.account_type}</span>
            </p>
            <p>
              Address:{" "}
              <Link to="/sell/user/address" className="view__address">
                View your address
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default UserProfile;
