import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// components
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// css
import "../../../Css/UserDealerProfileEdit.css";
import "../../../App.css";

// default image
import customer__profile__img from "../../../Image/customer__profile__img.PNG";

// api
import { apiUrl } from "../../../utils/apis";
import { USER_API_ENDPOINTS } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";

const UserProfileEdit = () => {
  const [userData, setUserData] = useState({ ProfilePic: "" });
  const [uploadedImage, setUploadedImage] = useState({ photo: "" });

  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const history = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) throw new Error("Token not found!");

      const response = await axios.get(USER_API_ENDPOINTS.GET_CUSTOMER_PROFILE, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const authData = JSON.parse(localStorage.getItem("KTMauth"));
      const updatedUser = { ...authData, ...response.data };
      setUserData(updatedUser);

      const profilePic = response.data?.ProfilePic;

      if (profilePic && profilePic !== "") {
        const fullURL = profilePic.startsWith("http") ? profilePic : `${apiUrl}${profilePic}`;
        setUploadedImage({ photo: fullURL });
      } else {
        setUploadedImage({ photo: customer__profile__img });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUploadedImage({ photo: customer__profile__img }); // fallback on error
    }
  };

  const updatePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (reader.readyState === 2) {
        setUploadedImage({ photo: reader.result });
      }
    };

    try {
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) throw new Error("Token not found!");

      const data = new FormData();
      data.append("ProfilePic", file);
      data.append("auth_id", apiKey["id"]);
      data.append("mobile_number", userData.mobile_number);
      data.append("account_type", apiKey["account_type"]);
      data.append("account_category", apiKey["account_category"]);

      await axios.put(USER_API_ENDPOINTS.GET_CUSTOMER_PROFILE, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      Swal.fire({
        title: "Profile Pic changed successfully",
        confirmButtonColor: "#56b124",
      });

      fetchUserData(); // refresh data
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Swal.fire({
        title: "Failed to upload profile picture",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <>
      <Navbar />
      <UserProfileSearchbar />
      <UserProfileNavbar />

      {userData && (
        <div className="user__dealer__profile__edit similar__section">
          <h1 className="similar__section__heading">Edit your profile</h1>

          {/* Profile Picture Preview */}
          <div className="profile__pic__preview" style={{ marginBottom: "20px" }}>
            <img
              src={uploadedImage.photo || customer__profile__img}
              alt="Profile"
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
            id="photo"
            name="photo"
            onChange={updatePhoto}
            onClick={(e) => {
              e.target.value = null;
            }}
          />
          <label htmlFor="photo" className="change__pic__label">
            Select Profile Pic
          </label>

          <form>
            <input
              type="text"
              placeholder="Name"
              value={userData.full_name ?? ""}
              name="full_name"
              disabled
            />

            <input
              type="email"
              placeholder="Email ID"
              value={userData.email ?? ""}
              name="email"
              disabled
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              value={userData.phone_number ?? ""}
              name="mobile_number"
              disabled
            />
          </form>

          <button
            className="form__button"
            style={{ marginTop: "20px", width: "fit-content" }}
            onClick={() => history.push("/sell/user/change-password")}
          >
            Change Password
          </button>
        </div>
      )}

      <MainFooter />
      <TermFooter />
    </>
  );
};

export default UserProfileEdit;
