import React from "react";

// css
import "../../../../Css/DealerPriceItemCard.css";

const DealerPriceListCard = (props) => {
  return (
    <div className="dealer__price__item__card">
      <div className="details__section">
        <div className="img">
          <img src={props.img} alt="" />
        </div>
        <div className="details">
          <h1 className="details__heading">
            {props.name[0].toUpperCase() + props.name.slice(1)}
          </h1>
          {props.pincodeDetails.map((eachDetail, eachDetailIndex) => {
            return (
              <div className="price__section" key={eachDetailIndex}>
                <h1>{eachDetail.pincode}</h1>
                <p>{eachDetail.price}</p>
                <span>{eachDetail.priceIn}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="action__section">
        <div className="agree">
          <p>Kabadi Techno Commission 1% Per/kg</p>
        </div>
        <button>Edit Price</button>
      </div>
    </div>
  );
};

export default DealerPriceListCard;
