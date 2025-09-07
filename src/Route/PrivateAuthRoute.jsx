import { Redirect, Route } from "react-router-dom";

const PrivateAuthRoute = ({ component: Component, ...rest }) => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!apiKey) {
          return <Component />;
        }

        const isCustomer = apiKey.account_type === "Personal" || apiKey.account_type === "Organization";
        const intendedPath = isCustomer ? "/sell/user/profile" : "/dealer/home";

        // Avoid redirect loop if already on the correct path
        if (location.pathname !== intendedPath) {
          return <Redirect to={intendedPath} />;
        }

        return null; // Avoid rendering anything since redirect already happened
      }}
    />
  );
};

export default PrivateAuthRoute;
