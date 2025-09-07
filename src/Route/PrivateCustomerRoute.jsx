import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateCustomerRoute = ({ component: Component, ...rest }) => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  return (
    <Route
      {...rest}
      render={() =>
        apiKey !== null ? (
          apiKey['account_type'] === "Customer" ? (
            <Component />
          ) : (
            <Redirect to="/signin" />
          )
        ) : (
          <Redirect to="/signin" />
        )
      }
    />
  );
};



export default PrivateCustomerRoute;
