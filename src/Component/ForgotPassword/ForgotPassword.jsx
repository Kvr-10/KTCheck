import React, { useEffect } from "react";

// component
import Navbar from "../Navbar";
import LeftBanner from "../AuthPageBanner/LeftBanner";
import ForgotPasswordStep1 from "./ForgotPasswordStep1";
import ForgotPasswordStep2 from "./ForgotPasswordStep2";
import TermFooter from "../Footer/TermFooter";

// css
import "../../Css/Auth.css";

// redux
import { useSelector } from "react-redux";

const ForgotPassword = () => {
  const forgotPasswordStep = useSelector(
    (state) => state.stepReducer.forgotPasswordStep
  );

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      <div className="auth__section">
        <LeftBanner />

        {(() => {
          if (forgotPasswordStep === 1) {
            return <ForgotPasswordStep1 />;
          } else if (forgotPasswordStep === 2) {
            return <ForgotPasswordStep2 />;
          }
        })()}
      </div>

      <TermFooter />
    </>
  );
};

export default ForgotPassword;
