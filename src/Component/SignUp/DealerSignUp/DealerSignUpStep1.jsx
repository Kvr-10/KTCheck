import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

// css
import "../../../Css/Auth.css";

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../../Redux/stepReducer";

const DealerSignUpStep1 = () => {
  const dispatch = useDispatch();

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // next step
  const nextStep = (type) => {
    const infos = JSON.parse(localStorage.getItem("KTMinfo"));
    infos["userType"] = type;
    localStorage.setItem("KTMinfo", JSON.stringify(infos));
    dispatch(stepReducerActions.forward("dealerSignUpStep"));
  };

  return (
    <div className="section">
      <h1>Sign Up</h1>

      <div className="person__type">
        <h1>What type of dealer am I ?</h1>
        <div>
          <h1>
            We purchase scrap from house, shops, restaurant, office marriage
            hall, etc
          </h1>
          <button
            className="person__type__button"
            onClick={nextStep.bind(this, "kabadiwala")}
          >
            Kabadiwala
          </button>
        </div>
        <div>
          <h1>
            we purchase from college, hospital, school, malls, university,
            factory, etc.
          </h1>
          <button
            className="person__type__button"
            onClick={nextStep.bind(this, "collector")}
          >
            Collector
          </button>
        </div>
        <div>
          <h1>We purchase scrap from kabadiwala and collector</h1>
          <button
            className="person__type__button"
            onClick={nextStep.bind(this, "recycler")}
          >
            Recycler
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
  );
};

export default DealerSignUpStep1;
