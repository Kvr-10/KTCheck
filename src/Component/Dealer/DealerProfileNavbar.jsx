import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";

// css
import "../../Css/ProfileNavbar.css";

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";
import { USER_API_ENDPOINTS } from "../../utils/apis";
import { getAccessTokenFromRefresh } from "../../utils/helper";
import { clearAdminOTPVerification } from "../../utils/adminAuth";
import axios from "axios";

// icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';

const DealerProfileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  // ✅ Correct logout logic
  const logOut = async () => {
    try {
      const accessToken = await getAccessTokenFromRefresh();

      await axios.get(USER_API_ENDPOINTS.LOGOUT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      dispatch(stepReducerActions.reset("cartStep"));
      localStorage.clear();
      // Clear admin OTP verification
      clearAdminOTPVerification();
      history.push("/signin");

    } catch (err) {
      console.error("Logout error:", err);
      if (err.response?.status === 401) {
        dispatch(stepReducerActions.reset("cartStep"));
        localStorage.clear();
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
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <ul className={isOpen ? "profile__navbar profile__navbar__active" : "profile__navbar"}>
        <li>
          <NavLink to="/dealer/home" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <HomeIcon /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/dealer/profile" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <AccountCircleIcon /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/dealer/pickup" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <TransferWithinAStationIcon /> Pickup
          </NavLink>
        </li>
        <li>
          <NavLink to="/dealer/marketplace" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <StorefrontIcon /> Marketplace
          </NavLink>
        </li>
        <li>
          <NavLink to="/dealer/bill" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <AccountBalanceWalletIcon /> Bill
          </NavLink>
        </li>
          {/* <li>
            <NavLink to="/dealer/wallet" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
              <AccountBalanceWalletIcon /> Wallet
            </NavLink>
          </li> */}
        {/* <li>
          <NavLink to="/dealer/settings" className="profile__link" activeClassName="active__profile__link" onClick={() => setIsOpen(false)}>
            <SettingsIcon /> Settings
          </NavLink>
        </li> */}
        <li>
          <button className="profile__link" onClick={logOut}>
            <ExitToAppIcon /> Logout
          </button>
        </li>
      </ul>
    </>
  );
};

export default DealerProfileNavbar;
