import React from "react";

// css
import "../../../Css/DealerHomeCard.css";

const DealerHomeCard = ({ title, number, onClick, isClickable }) => {
  return (
    <div
      className={`dealer__home__card ${isClickable ? "clickable" : ""}`}
      onClick={onClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <h3>{title}</h3>
      <p>{number}</p>
    </div>
  );
};

export default DealerHomeCard;
