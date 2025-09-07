import React from "react";
import "../../Css/Donation.css";
import { useEffect } from "react";
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";
import backgroundImage from "../../Images/image1.png";
import gpayImg from "../../Images/gpay.png";
import phonepeImg from "../../Images/phnpe.png";
import upiImg from "../../Images/Upi.png";
import creditImg from "../../Images/credit.png";
import circularImage from "../../Images/image 20.png";

const Donation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Navbar />
      <div className="donationMainConatiner">
        <div className="firstHeadingOfDonation">
          <img
            className="donationBackgoundImage"
            src={backgroundImage}
          />
          <div className="headingDonation">
            <div></div>
            <div className="supportFuture">
              <h1>Support a Cleaner Future</h1>
              <p>Donate to Waste Management Initiatives Today!</p>
            </div>
          </div>
        </div>

        <div className="donation">
          <div>
            <form>
              <label for="fname">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name.."
              />
              <label for="lname">Phone Number</label>
              <input
                type="number"
                id="number"
                name="Phone Number"
                placeholder="Phone Number"
              />
              <label for="country">Email</label>
              <input type="email" id="email" name="email" placeholder="Email" />
              <label for="country">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="Amount"
              />
              {/* <label for="payment">Choose your Payment</label>
              <div className="secure">
                <p>Secure</p>
              </div>
              <div className="payment">
                <div>
                  <img src={gpayImg} />
                  <p>Google Pay</p>
                </div>
                <div>
                  <img src={phonepeImg} />
                  <p>Phonepe</p>
                </div>
                <div>
                  <img src={upiImg} />
                  <p>Other UPI</p>
                </div>
                <div>
                  <img src={creditImg} />
                  <p>Credit/Debit Card</p>
                </div>
              </div> */}
            </form>
          </div>
          <div className="donationImage">
            <div className="donationCircularImage">
              <img src={circularImage} alt="" />
            </div>
            <div className="rectangle-270">
              <p>
                By donating to our cause, you directly contribute to vital
                projects that address waste reduction, recycling, education, and
                community engagement. Together, we can tackle the pressing
                challenges of waste management and build a brighter future for
                generations to come.
              </p>
            </div>
          </div>
        </div>
      </div>
      <MainFooter />
      <TermFooter />
    </>
  );
};

export default Donation;
