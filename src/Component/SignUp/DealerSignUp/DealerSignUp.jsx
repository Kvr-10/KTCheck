import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { stepReducerActions } from "../../../Redux/stepReducer";

import Navbar from "../../Navbar";
import RightBanner from "../../AuthPageBanner/RightBanner";
import DealerSignUpStep1 from "./DealerSignUpStep1";
import DealerSignUpStep2 from "./DealerSignUpStep2";
import SignUpAddressInfoStep from "../SignUpCommonStep/SignUpAddressInfoStep";
import TermFooter from "../../Footer/TermFooter";

// css
import "../../../Css/Auth.css";
const DealerSignUp = () => {
  const dispatch = useDispatch();
  const dealerSignUpStep = useSelector(
    (state) => state.stepReducer.dealerSignUpStep
  );

  // scroll to top and reset step
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(stepReducerActions.reset("dealerSignUpStep")); // Reset step to 1 on mount
  }, [dispatch]);

  return (
    <>
      <Navbar />

      <div className="auth__section">
        {(() => {
          if (dealerSignUpStep === 1) {
            return <DealerSignUpStep1 />;
          } else if (dealerSignUpStep === 2) {
            return <DealerSignUpStep2 />;
          } else if (dealerSignUpStep === 3) {
            return <SignUpAddressInfoStep />;
          }
        })()}

        <RightBanner />
      </div>

      <TermFooter />
    </>
  );
};

export default DealerSignUp;