import React, { useEffect } from "react";

// component
import Navbar from "../../../Navbar";
import RightBanner from "../../../AuthPageBanner/RightBanner";
import CustomerSignUpPersonalStep1 from "../CustomerSignUpPersonal/CustomerSignUpPersonalStep1";
import SignUpAddressInfoStep from "../../SignUpCommonStep/SignUpAddressInfoStep";
import TermFooter from "../../../Footer/TermFooter";

// css
import "../../../../Css/Auth.css";

// redux
import { useSelector } from "react-redux";

const CustomerSignUpPersonal = () => {
  const customerSignUpPersonalStep = useSelector(
    (state) => state.stepReducer.customerSignUpPersonalStep
  );

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      <div className="auth__section">
        {(() => {
          if (customerSignUpPersonalStep === 1) {
            return <CustomerSignUpPersonalStep1 />;
          } else if (customerSignUpPersonalStep === 2) {
            return <SignUpAddressInfoStep />;
          }
        })()}

        <RightBanner />
      </div>

      <TermFooter />
    </>
  );
};

export default CustomerSignUpPersonal;
