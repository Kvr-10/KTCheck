import React, { useEffect } from "react";

// component
import Navbar from "../../../Navbar";
import RightBanner from "../../../AuthPageBanner/RightBanner";
import CustomerSignUpOrganizationStep1 from "../CustomerSignUpOrganization/CustomerSignUpOrganizationStep1";
import SignUpAddressInfoStep from "../../SignUpCommonStep/SignUpAddressInfoStep";
import TermFooter from "../../../Footer/TermFooter";

// css
import "../../../../Css/Auth.css";

// redux
import { useSelector } from "react-redux";

const CustomerSignUpOrganization = () => {
  const customerSignUpOrganizationStep = useSelector(
    (state) => state.stepReducer.customerSignUpOrganizationStep
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
          if (customerSignUpOrganizationStep === 1) {
            return <CustomerSignUpOrganizationStep1 />;
          } else if (customerSignUpOrganizationStep === 2) {
            return <SignUpAddressInfoStep />;
          }
        })()}

        <RightBanner />
      </div>

      <TermFooter />
    </>
  );
};

export default CustomerSignUpOrganization;
