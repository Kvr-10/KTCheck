import React, { useEffect, useState } from "react";
import axios from "axios";
import UserDealerPickupCard from "./DealerPickupCard"; // adjust path if needed

const DealerPickupList = () => {
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    const dealer_id = localStorage.getItem("KTMuath");
    axios.get(`${USER_API_ENDPOINTS.GET_DEALER_PICKUP}${dealer_id}`)
      .then(res => setPickups(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      {pickups.map(pickup => (
        <UserDealerPickupCard
          key={pickup.id}
          order_no={pickup.order_number}
          date={pickup.created_at}
          total_cart_items={pickup.total_cart_items}
          total_amount={pickup.total_amount}
          status={pickup.status}
          // add other props as needed
        />
      ))}
    </div>
  );
};

export default DealerPickupList;
