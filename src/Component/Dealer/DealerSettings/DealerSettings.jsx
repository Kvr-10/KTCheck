import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

// css
import "../../../Css/DealerSettings.css";
import "../../../App.css";

// component
import Navbar from "../../Navbar";
import DealerProfileSearchbar from "../DealerProfileSearchbar";
import DealerProfileNavbar from "../DealerProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// material icon

import DescriptionIcon from '@mui/icons-material/Description';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

const DealerSettings = () => {
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__settings__section similar__section">
        <h1 className="similar__section__heading">Complete Your Profile</h1>
        <div className="settings__section">
          <NavLink
            className="settings__link"
            to="/dealer/settings/documentupload"
          >
            <span>
              <DescriptionIcon />
              <p>Documents Upload</p>
            </span>
            {/* <h1>Status</h1> */}
          </NavLink>
          <NavLink className="settings__link" to="/dealer/settings/addarea">
            <span>
              <AddLocationIcon />
              <p>Add Area Pincode</p>
            </span>
            {/* <h1>Status</h1> */}
          </NavLink>
          <NavLink className="settings__link" to="/dealer/settings/setprice">
            <span>
              <CreditCardIcon />
              <p>Add Your Price</p>
            </span>
            {/* <h1>Status</h1> */}
          </NavLink>
          <NavLink className="settings__link" to="/dealer/settings/addemployee">
            <span>
              <PersonAddAltIcon />
              <p>Add Employee</p>
            </span>
            {/* <h1>Status</h1> */}
          </NavLink>
          <NavLink
            className="settings__link"
            to="/dealer/settings/requestcategory"
          >
            <span>
              <AddToPhotosIcon />
              <p>
                Request to
                <br />
                Add Category
              </p>
            </span>
            {/* <h1>Status</h1> */}
          </NavLink>
        </div>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default DealerSettings;
