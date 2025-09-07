import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// css
import "../../Css/SellItemCard.css";
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";
// import ProfilePic from '../../Image/Profile_Pic.png';

const MarketPlaceCard = (props) => {

  const history = useHistory()
  const [dealerData, setDealerData] = useState([]);

  // get Dealer profile data
  useEffect(() => {
    const {dealer_id} = props;
    axios.get(USER_API_ENDPOINTS.GET_DEALER_DETAILS_PROFILE + `${dealer_id}`)
      .then((res) => {
        setDealerData(res.data)
      }).catch((err) => {
        console.log(err)
      })
  }, [])

  const redirection = () => {
    history.push(`/marketplace/${dealerData.kt_id}`);
  }
  return (
    <div className="sell__item__card">
      <img src={`${apiUrl}/${dealerData.ProfilePic}`} alt="" />
      {/* <img src={ProfilePic} alt="" /> */}
      <div className="description">
        <h1>{dealerData.username}</h1>
        <p>Dealer Type : <span>{dealerData.account_type}</span></p>
        <p>Mobile Number : <span>{dealerData.mobile_number}</span></p>
        {/* <p>Area : <span>{dealerData.address}, {dealerData.city} </span></p> */}
        <button onClick={redirection}>View Prices</button>
      </div>
    </div>
  );
};

export default MarketPlaceCard;
