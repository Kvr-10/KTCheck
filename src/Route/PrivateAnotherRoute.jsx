import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateAnotherRoute = ({ component: Component, ...rest }) => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  console.log(apiKey);
  // console.log(apiKey["role"]);
  return (
    <Route
      {...rest}
      render={() =>
        apiKey !== null ? (
          apiKey["account_type"] === "Collector" ? (
            <Component />
          ) : (
            <Redirect to="/dealer/home" />
          )
        ) : (
          <Component />
        )
      }
    />
  );
};

export default PrivateAnotherRoute;
