import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// Component imports
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// CSS
import "../../../Css/UserDealerProfileEdit.css";

// Default image
import customer__profile__img from "../../../Image/customer__profile__img.PNG";

// API + Helper
import { apiUrl, USER_API_ENDPOINTS } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";
import DealerProfileNavbar from "../DealerProfileNavbar";

const DealerProfileEdit = () => {
  const [dealerData, setDealerData] = useState({});
  const [profilePicURL, setProfilePicURL] = useState(customer__profile__img);
  const history = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDealerData();
  }, []);

  const fetchDealerData = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) throw new Error("Token not found!");

      const response = await axios.get(USER_API_ENDPOINTS.GET_DEALER_PROFILE, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profileData = response.data;
      const localAuth = JSON.parse(localStorage.getItem("KTMauth") || "{}");

      const combinedData = {
        ...localAuth,
        ...profileData,
      };

      setDealerData(combinedData);

      const pic = profileData?.ProfilePic;
      if (pic && pic !== "") {
        const fullURL = pic.startsWith("http") ? pic : `${apiUrl}${pic}`;
        setProfilePicURL(fullURL);
      } else {
        setProfilePicURL(customer__profile__img);
      }
    } catch (error) {
      console.error("Error fetching dealer data:", error);
      setProfilePicURL(customer__profile__img); // fallback
    }
  };

  const updatePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview instantly
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.readyState === 2) {
        setProfilePicURL(reader.result);
      }
    };

    try {
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) throw new Error("Token not found!");

      const formData = new FormData();
      formData.append("ProfilePic", file);

      await axios.put(USER_API_ENDPOINTS.UPDATE_DEALER_PROFILE, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      Swal.fire({
        title: "Profile picture updated successfully!",
        confirmButtonColor: "#56b124",
      });

      fetchDealerData(); // refresh image from server
    } catch (error) {
      console.error("Error uploading dealer profile picture:", error);
      Swal.fire({
        title: "Failed to upload dealer profile picture",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <>
      <Navbar />
      <UserProfileSearchbar />
      <DealerProfileNavbar  />

      <div className="user__dealer__profile__edit similar__section">
        <h1 className="similar__section__heading">Edit your Dealer Profile</h1>

        <div className="profile__pic__preview" style={{ marginBottom: "20px" }}>
          <img
            src={profilePicURL || customer__profile__img}
            alt="Dealer Profile"
            className="profile__image"
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
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="dealerPhoto"
          name="dealerPhoto"
          onChange={updatePhoto}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
        <label htmlFor="dealerPhoto" className="change__pic__label">
          Select Profile Pic
        </label>

        <form>
          <input type="text" value={dealerData.full_name ?? ""} placeholder="Name" disabled />
          <input type="email" value={dealerData.email ?? ""} placeholder="Email" disabled />
          <input type="tel" value={dealerData.phone_number ?? ""} placeholder="Phone" disabled />
        </form>

        <button
          className="form__button"
          style={{ marginTop: "20px", width: "fit-content" }}
          onClick={() => history.push("/sell/user/change-password")}
        >
          Change Password
        </button>
      </div>

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default DealerProfileEdit;
