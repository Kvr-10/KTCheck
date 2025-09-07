import React, { useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";

// component
import Navbar from "../Navbar";
import RightBanner from "../AuthPageBanner/RightBanner";
import TermFooter from "../Footer/TermFooter";

// css
import "../../Css/Auth.css";

const SignUp = () => {
  const history = useHistory();

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // create initial localstorage for signup infos
  useEffect(() => {
    localStorage.setItem(
      "KTMinfo",
      JSON.stringify({
        isCustomer: false,
        isDealer: false,
        isPersonalAccount: false,
        isOrganizationAccount: false,
        userType: "",
        name: "",
        email: "",
        phone: "",
        password1: "",
        password2: "",
      })
    );
  }, []);

  // next step
  const nextStep = (type, destination) => {
    const infos = JSON.parse(localStorage.getItem("KTMinfo"));
    if (type === "customer") {
      infos["isCustomer"] = true;
      infos["isDealer"] = false;
    } else {
      infos["isDealer"] = true;
      infos["isCustomer"] = false;
    }
    localStorage.setItem("KTMinfo", JSON.stringify(infos));
    history.push(destination);
  };

  return (
    <>
      <Navbar />

      <div className="auth__section">
        <div className="section">
          <h1>Sign Up</h1>

          <div className="person__type">
            <h1>Who am I ?</h1>
            <div>
              <h1>I want to sell my scrap</h1>
              <button
                className="person__type__button"
                onClick={nextStep.bind(
                  this,
                  "customer",
                  "/signin/signup/customer"
                )}
              >
                I am customer
              </button>
            </div>
            <div>
              <h1>I want to purchase the scrap</h1>
              <button
                className="person__type__button"
                onClick={nextStep.bind(this, "dealer", "/signin/signup/dealer")}
              >
                I am dealer
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

export default SignUp;
