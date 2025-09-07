import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// css
import "../../../../Css/DealerEditPrice.css";
import "../../../../App.css";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import DealerEditPriceCard from "./DealerEditPriceCard";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";

// redux
import { useSelector } from "react-redux";
import axios from "axios";
import { apiUrl } from "../../../../Private";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const DealerEditPrice = () => {
  const priceItemName = useSelector((state) => state.itemNameReducer.priceItemName);
  const [dealerEditPriceItemData,setDealerEditPriceItemData] = useState([]);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  //get subcategory data
  useEffect(() => {
    axios.get(USER_API_ENDPOINTS.GET_ALL_SUB_CATEGORY_LIST)
    .then((res) => {
      setDealerEditPriceItemData(res.data)
    })
    .catch((err) => {
      setDealerEditPriceItemData(err.response.data)
    })
    
  },[])

  return (
    <>
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__edit__price similar__section">
        <h1 className="similar__section__heading">
          Set Price For{" "}
          {priceItemName !== ""
            ? priceItemName[0].toUpperCase() + priceItemName.slice(1)
            : "All"}{" "}
          Category
        </h1>
        {/* <Link to="/dealer/settings/setprice/editprice/pricelist" className="dealer__price__list">Price List</Link> */}
        <button
          onClick={() => {
            history.push("/dealer/settings/setprice/editprice/pricelist");
          }}
        >
          Price List
        </button>

        <div className="edit__price">
          {dealerEditPriceItemData.map((eachData, eachDataIndex) => {
            
            return (
              <DealerEditPriceCard
                key={eachDataIndex}
                img={eachData.sub_image}
                name={eachData.sub_name}
                category={eachData.category}
                subcategory={eachData.id}
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

export default DealerEditPrice;
