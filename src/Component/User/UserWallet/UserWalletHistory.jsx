import React, { useState, useEffect } from "react";

// component
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import UserDealerWalletHistoryCard from "../../UserDealerSimilarComponent/UserDealerWalletHistoryCard";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// css
import "../../../Css/UserDealerWalletHistory.css";
import "../../../App.css";

// wallet history data
import { WalletHistoryData } from "../../UserDealerSimilarComponent/WalletHistoryData";

const UserWalletHistory = () => {
  const [walletHistoryData] = useState(WalletHistoryData);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      <UserProfileSearchbar />

      <UserProfileNavbar />

      <div className="user__dealer__wallet__history similar__section">
        <h1 className="similar__section__heading">Your Wallet History</h1>
        {walletHistoryData.length !== 0 ? (
          walletHistoryData.map((eachHistory, eachHistoryIndex) => {
            return (
              <UserDealerWalletHistoryCard
                key={eachHistoryIndex}
                paymentTypeImg={eachHistory.paymentTypeImg}
                transactionId={eachHistory.transactionId}
                transferTo={eachHistory.transferTo}
                mobileNo={eachHistory.mobileNo}
                amount={eachHistory.amount}
                date={eachHistory.date}
              />
            );
          })
        ) : (
          <p>No wallet history available here</p>
        )}
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default UserWalletHistory;
