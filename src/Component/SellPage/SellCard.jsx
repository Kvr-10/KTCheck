import React from "react";
import "../../App.css";
import { apiUrl } from "../../Private";

const SellCard = ({ pic, title, onClick }) => {
  // extra for localhost as well
  const image_url = `${apiUrl}${pic}`;

  return (
    <button
      className="scrap__section__card"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={image_url}
        alt={title}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "contain",
          marginBottom: "10px",
        }}
      />
      <p>{title[0].toUpperCase() + title.slice(1).toLowerCase()}</p>
    </button>
  );
};

export default SellCard;
