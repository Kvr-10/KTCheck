import React, { useEffect, useState } from "react";
import axios from "axios";

import { apiUrl } from "../../../../Private";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import DealerSetPriceCard from "./DealerSetPriceCard";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";
import Navbar from "../../../Navbar";
// css
import "../../../../App.css";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

// scrap item data
// import { ScrapItemData } from "../../../ScrapItemData";

const DealerSetPrice = () => {
  // const [scrapItemData] = useState(ScrapItemData);
  const [scrapCategoryData, setScrapCategoryData] = useState([]);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get sell category data
  useEffect(() => {
    axios
      // .get(`${apiUrl}/store/get-categories/`)
      .get(USER_API_ENDPOINTS.GET_CATEGORY)
      .then((res) => {
        console.log(res.data);
        setScrapCategoryData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__set__price similar__section">
        <h1 className="similar__section__heading" style={{ marginBottom: "0" }}>
          Set Your Price
        </h1>
        <div className="scrap__section">
          {scrapCategoryData.map((eachData, eachDataIndex) => {
            return (
              <DealerSetPriceCard
                key={eachDataIndex}
                img={eachData.image}
                title={eachData.name}
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

export default DealerSetPrice;
