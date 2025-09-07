import React from "react";

// css
import "../../../App.css";
import { apiUrl } from "../../../Private";

const UserAutoScrapCard = (props) => {
  const url = `${apiUrl}${props.img}` ;
  return (
    <button className="scrap__section__card" onClick={props.autoScrapService}>
      <img src={url} alt="" />
      <p>{props.title[0].toUpperCase() + props.title.slice(1)}</p>
    </button>
  );
};

export default UserAutoScrapCard;
