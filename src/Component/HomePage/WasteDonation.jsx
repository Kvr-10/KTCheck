import React from "react";
import "../../Css/WasteDonation.css";
import { useEffect } from "react";
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";
import backgroundImage from "../../Images/image1.png";
import circularImage from "../../Images/image 20.png";
import qrCodeImage from "../../Images/qrCode.png";

const WasteDonation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
    <Navbar/>
    <div className="donationDone">
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

      <div className="secondWasteDonation">
        <div className="wastedonationImage">
          <div className="wastedonationCircularImage">
            <img src={circularImage} alt="" />
          </div>
          <div className="rectangle-270-block2">
            <div>
              {/* <p>Thank you For Donation</p>
              <p>Name:</p>
              <p>Name:</p>
              <p>Name:</p>
              <p>Name:</p> */}
              <div>
                <img src={qrCodeImage} alt=" " />
                <p className="kabadiDonation">KabadiTechno pvt. ltd.</p>
                <p className="paraDonation">Donation</p>
              </div>
            </div>
          </div>
        </div>
        <div className="donationHeading">
          <p>
            "Donating for waste management transforms trash into treasure,
            creating a cleaner, greener future for all."
          </p>
        </div>
      </div>
    </div>
    <MainFooter/>
    <TermFooter/>
    </>
    
  );
};

export default WasteDonation;
