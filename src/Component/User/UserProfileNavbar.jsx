import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";

// css
import "../../Css/ProfileNavbar.css";

// material icon
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CropFreeIcon from "@mui/icons-material/CropFree";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";
import { apiUrl } from "../../utils/apis";
import axios from "axios";
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";
import { clearAdminOTPVerification } from "../../utils/adminAuth";

const UserProfileNavbar = () => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const history = useHistory();

  const logOut = async () => {
    try {
      const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
      const accessToken = await getAccessTokenFromRefresh();

      // Correct way: headers go in the second argument
      await axios.get(USER_API_ENDPOINTS.LOGOUT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      dispatch(stepReducerActions.reset("cartStep"));
      localStorage.removeItem("KTMauth");
      localStorage.removeItem("KTMpincode");
      localStorage.removeItem("KTMsellItemName");
      // Clear admin OTP verification
      clearAdminOTPVerification();
      history.push("/signin");

    } catch (err) {
      console.error("Logout error:", err);
      if (err.response?.status === 401) {
        dispatch(stepReducerActions.reset("cartStep"));
        localStorage.removeItem("KTMauth");
        localStorage.removeItem("KTMpincode");
        localStorage.removeItem("KTMsellItemName");
        // Clear admin OTP verification
        clearAdminOTPVerification();
        history.push("/signin");
      }
    }
  };


  return (
    <>
      <div
        className="menubar"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <ul
        className={
          isOpen ? "profile__navbar profile__navbar__active" : "profile__navbar"
        }
      >
        <li>
          <NavLink
            to="/sell/user/profile"
            className="profile__link"
            activeClassName="active__profile__link"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <AccountCircleIcon /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sell/user/pickup"
            className="profile__link"
            activeClassName="active__profile__link"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <TransferWithinAStationIcon /> Pickup
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sell/user/wallet"
            className="profile__link"
            activeClassName="active__profile__link"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <AccountBalanceWalletIcon /> Wallet
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sell/user/qr"
            className="profile__link"
            activeClassName="active__profile__link"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <CropFreeIcon /> QR Code
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sell/user/autoscrap"
            className="profile__link"
            activeClassName="active__profile__link"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <AutorenewIcon /> Auto Scrap
          </NavLink>
        </li>
        <li>
          <button
            className="profile__link"
            onClick={logOut}
          >
            <ExitToAppIcon /> Logout
          </button>
        </li>

      </ul>
    </>
  );
};

export default UserProfileNavbar;
