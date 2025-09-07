import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateDealerRoute = ({ component: Component, ...rest }) => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth")); 

  console.log("is dealer? : " + apiKey.account_type);
  
  return (
    <Route
      {...rest}
      render={() => {
        console.log(apiKey.account_type === "Dealer");
        return apiKey !== null ? (
          apiKey.account_type === "Dealer" ? (
            <Component />
          ) : (
            <Redirect to="/signin" />
          )
        ) : (
          <Redirect to="/signin" />
        );
      }}
    />

  );
};

export default PrivateDealerRoute;
