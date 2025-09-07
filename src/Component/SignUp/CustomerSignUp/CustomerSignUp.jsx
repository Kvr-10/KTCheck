import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";

// material ui component
import {Select , FormControl } from "@mui/material";

// component
import Navbar from "../../Navbar";
import RightBanner from "../../AuthPageBanner/RightBanner";
import TermFooter from "../../Footer/TermFooter";

// css
import "../../../Css/Auth.css";

const CustomerSignUp = () => {
  const [optionValue, setOptionValue] = useState("");

  const history = useHistory();

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get option value
  const optionChange = (e) => {
    setOptionValue(e.target.value);
  };

  // next step
  const nextStep = (type, destination) => {
    const infos = JSON.parse(localStorage.getItem("KTMinfo"));
    if (optionValue !== "") {
      if (type === "personal") {
        infos["isPersonalAccount"] = true;
        infos["isOrganizationAccount"] = false;
      } else {
        infos["isOrganizationAccount"] = true;
        infos["isPersonalAccount"] = false;
      }
      infos["userType"] = optionValue;
      localStorage.setItem("KTMinfo", JSON.stringify(infos));
      setOptionValue("");
      history.push(destination);
    }
  };

  return (
    <>
      <Navbar />

      <div className="auth__section">
        <div className="section">
          <h1>Sign Up</h1>

          <div className="person__type">
            <h1>What type of customer am I ?</h1>
            <div>
              <h1>
                People selling from house, shop, Restaurants, offices, marriage
                hall etc (Who produce less scrap)
              </h1>

              <FormControl variant="outlined" className="person__type__select">
                <Select native onChange={optionChange} value={optionValue}>
                  <option value="">Select type</option>
                  <option value={"House"}>House</option>
                  <option value={"Shop"}>Shop</option>
                  <option value={"Restaurant"}>Restaurant</option>
                  <option value={"Office"}>Office</option>
                  <option value={"Marriage Hall"}>Marriage Hall</option>
                </Select>
              </FormControl>
              <button
                className="person__type__button"
                onClick={nextStep.bind(
                  this,
                  "personal",
                  "/signin/signup/customer/personal"
                )}
              >
                Personal Account
              </button>
            </div>
            <div>
              <h1>
                People selling from college, hospital, school, malls,
                university, factory, etc. (Who produce more scrap)
              </h1>

              <FormControl variant="outlined" className="person__type__select">
                <Select native onChange={optionChange} value={optionValue}>
                  <option value="">Select type</option>
                  <option value={"College"}>College</option>
                  <option value={"Hospital"}>Hospital</option>
                  <option value={"School"}>School</option>
                  <option value={"Mall"}>Mall</option>
                  <option value={"University"}>University</option>
                  <option value={"Factory"}>Factory</option>
                  <option value={"Hotel"}>Hotel</option>
                </Select>
              </FormControl>
              <button
                className="person__type__button"
                onClick={nextStep.bind(
                  this,
                  "organization",
                  "/signin/signup/customer/organization"
                )}
              >
                Organization Account
              </button>
            </div>
          </div>
          <p>
            Already have an account?{" "}
            <NavLink className="signin__link" to="/signin">
              Sign In
            </NavLink>
          </p>
        </div>

        <RightBanner />
      </div>

      <TermFooter />
    </>
  );
};

export default CustomerSignUp;
