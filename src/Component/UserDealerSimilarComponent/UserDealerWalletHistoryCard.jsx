import React from "react";

// css
import "../../Css/UserDealerWalletHistoryCard.css";

const UserDealerWalletHistoryCard = (props) => {
  return (
    <div className="user__dealer__wallet__history__card">
      <div className="left__side">
        <img src={props.paymentTypeImg} alt="" />
      </div>
      <div className="right__side">
        <p>
          Transaction ID : <span>{props.transactionId}</span>
        </p>
        <p>
          Transfer to : <span>{props.transferTo}</span>
        </p>
        <p>
          Mobile No : <span>{props.mobileNo}</span>
        </p>
        <p>
          Amout : <span>{props.amount}</span>
        </p>
        <p>
          Date : <span>{props.date}</span>
        </p>
      </div>
    </div>
  );
};

export default UserDealerWalletHistoryCard;
