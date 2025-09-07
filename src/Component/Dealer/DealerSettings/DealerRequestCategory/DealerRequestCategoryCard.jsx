import React from "react";

// css
import "../../../../Css/DealerRequestCategoryCard.css";
import { apiUrl } from "../../../../Private";

const DealerRequestCategoryCard = (props) => {

  const image_url = `${apiUrl}/${props.img}`

  return (
    <div className="dealer__request__category__card">
      <img src={image_url} alt="" />
      <h1>{props.name}</h1>
      <p>{props.description}</p>
      <span>{props.status}</span>
    </div>
  );
};

export default DealerRequestCategoryCard;
