import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import Swal from "sweetalert2";

// material icon
import HistoryIcon from '@mui/icons-material/History';

// image
import wallet from "../../../Image/wallet.png";
import gpay from "../../../Image/gpay.png";
import phonepe from "../../../Image/phonepe.png";
import paytm from "../../../Image/paytm.png";

// css
import "../../../Css/UserDealerWallet.css";
import "../../../App.css";

// component
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

const UserWallet = () => {
  const [walletStep, setWalletStep] = useState({ step2: false, step3: false });
  const [inputValue, setInputValue] = useState({
    mobileNumber: "",
    transferAmount: "",
  });

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get input value
  const getInputValue = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  // show step2
  const showStep2 = () => {
    // setWalletStep({ step2: true, step3: false });
    Swal.fire({
      title: "This service is not available right now",
      confirmButtonColor: "#56b124",
    });
  };

  // show step3
  const showStep3 = () => {
    if (inputValue.mobileNumber !== "" && inputValue.transferAmount !== "") {
      setWalletStep({ step2: true, step3: true });
      setInputValue({
        mobileNumber: "",
        transferAmount: "",
      });
      setTimeout(() => {
        setWalletStep({ step2: false, step3: false });
      }, 5000);
    } else {
      Swal.fire({
        title: "Fill the input fields properly",
        confirmButtonColor: "#56b124",
      });
    }
  };

  return (
    <>
      <Navbar />

      <UserProfileSearchbar />

      <UserProfileNavbar />

      <div className="user__dealer__wallet__section similar__section">
        <h1 className="similar__section__heading">Your Wallet</h1>
        <div className="user__dealer__wallet">
          {/* wallet step 1 */}
          <div className="user__dealer__wallet__step user__dealer__wallet__step1">
            <NavLink
              className="user__dealer__wallet__history__icon"
              to="/sell/user/wallet/wallethistory"
              data-effect="solid"
              data-tip="Wallet history"
            >
              <HistoryIcon />
            </NavLink>
            <img src={wallet} alt="" />
            <h1>
              ₹ <span>0</span>
            </h1>
            <button
              className="user__dealer__wallet__button"
              disabled={walletStep.step2}
              onClick={showStep2}
            >
              Transfer Amount
            </button>
            <ReactTooltip />
          </div>

          {/* wallet step 2 */}
          {walletStep.step2 ? (
            <div className="user__dealer__wallet__step user__dealer__wallet__step2">
              <div>
                <img src={wallet} alt="" />
                <h1>
                  ₹ <span>0</span>
                </h1>
              </div>
              <div>
                <button>
                  <img src={gpay} alt="" />
                </button>
                <button>
                  <img src={phonepe} alt="" />
                </button>
                <button>
                  <img src={paytm} alt="" />
                </button>
              </div>
              <input
                type="tel"
                required
                onChange={getInputValue}
                value={inputValue.mobileNumber}
                name="mobileNumber"
                placeholder="Mobile Number"
              />
              <input
                type="text"
                required
                onChange={getInputValue}
                value={inputValue.transferAmount}
                name="transferAmount"
                placeholder="Transfer Amout"
              />
              <button
                className="user__dealer__wallet__button"
                disabled={walletStep.step3}
                onClick={showStep3}
              >
                Transfer Amout
              </button>
            </div>
          ) : null}

          {/* wallet step 3 */}
          {walletStep.step3 ? (
            <div className="user__dealer__wallet__step user__dealer__wallet__step3">
              <div>
                <img src={wallet} alt="" />
                <h1>
                  ₹ <span>0</span>
                </h1>
              </div>
              <h1>Transfer Successful</h1>
              <p>
                Transaction ID <span>0123456789</span>
              </p>
              <p>
                Amount Transfer on this number <span>8944837858</span>
                <span> to Google pay</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default UserWallet;
