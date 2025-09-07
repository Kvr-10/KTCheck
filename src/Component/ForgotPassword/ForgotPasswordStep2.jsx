import React from "react";
import { NavLink } from "react-router-dom";

// css
import "../../Css/Auth.css";

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from '../../Redux/stepReducer';

const ForgotPasswordStep2 = () => {
  const dispatch = useDispatch();

  return (
    <div className="section">
      <h1>Password Reset</h1>
      <p className="form__top__text" style={{ marginBottom: "70px" }}>
        Check your mail, we sent you reset password link.
      </p>
      <NavLink
        className="form__button"
        to="/signin"
        onClick={() => {
          dispatch(stepReducerActions.reset("forgotPasswordStep"));
        }}
      >
        Sign In
      </NavLink>
    </div>
  );
};

export default ForgotPasswordStep2;
