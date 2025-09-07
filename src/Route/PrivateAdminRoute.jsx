import React from "react";
import { Route, Redirect } from "react-router-dom";
import { checkAdminOTPVerification, isAdmin } from "../utils/adminAuth";

const PrivateAdminRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() => {
        // Check if user is logged in
        const authData = localStorage.getItem("KTMauth");
        if (!authData) {
          console.log("No auth data found, redirecting to signin");
          return <Redirect to="/signin" />;
        }

        // Check if user is admin
        if (!isAdmin()) {
          console.log("User is not an admin, redirecting to home");
          return <Redirect to="/" />;
        }

        // Check if OTP verification is valid for current auth token
        if (!checkAdminOTPVerification()) {
          console.log("OTP verification required, redirecting to OTP verification");
          return <Redirect to="/admin/otp-verification" />;
        }

        console.log("Admin access granted");
        return <Component />;
      }}
    />
  );
};

export default PrivateAdminRoute;
