import React, { useEffect, useState } from "react";

// css
import "../../../../Css/DealerPriceList.css";
import "../../../../App.css";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import DealerPriceListCard from "./DealerPriceListCard";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";

// dealer price list item data
import { DealerPriceListItemData } from "./DealerPriceListItemData";

const DealerPriceList = () => {
  const [dealerPriceListItemData] = useState(DealerPriceListItemData);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__price__list similar__section">
        <h1 className="similar__section__heading">Price List</h1>

        <div className="price__list">
          {dealerPriceListItemData.map((eachData, eachDataIndex) => {
            return (
              <DealerPriceListCard
                key={eachDataIndex}
                img={eachData.img}
                name={eachData.name}
                pincodeDetails={eachData.pincodeDetails}
              />
            );
          })}
        </div>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default DealerPriceList;
