// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import UserDealerPickupCard from "./DealerPickupCard"; // adjust path if needed
// import { USER_API_ENDPOINTS } from "../../../utils/apis"; // adjust path if needed

// const DealerPickupList = () => {
//   const [pickups, setPickups] = useState([]);

//   useEffect(() => {
//     const auth = JSON.parse(localStorage.getItem("KTMauth"));
//     const dealer_id = auth?.dealer_id;
//     axios.get(`${USER_API_ENDPOINTS.GET_DEALER_PICKUP}${dealer_id}`)
//       .then(res => setPickups(res.data))
//       .catch(err => console.log(err));
//   }, []);

//   return (
//     <div className="user__dealer__pickup">
//       {console.log("Pickups data:", pickups)}
//       {pickups.length !== 0 ? (
//         pickups.map((eachData) => (
//           <UserDealerPickupCard
//             key={eachData.id}
//             order_no={eachData.order_number}
//             date={eachData.created_at}
//             subcategory_name={eachData.subcategory_name}
//             subcategory_image={eachData.subcategory_image}
//             quantity={eachData.quantity}
//             unit={eachData.unit}
//             status={eachData.status}
//             price={eachData.price}
//             GST={eachData.GST}
//             // percentage={eachData.percentage}
//             total_cart_items={eachData.total_cart_items}
//             total_amount={eachData.total_amount}
//           />
//         ))
//       ) : (
//         <p>No pickup data available here</p>
//       )}
//       {/* Fallback for debugging */}
//       {pickups.length !== 0 && (
//         <pre>{JSON.stringify(pickups, null, 2)}</pre>
//       )}
//     </div>
//   );
// };

// export default DealerPickupList;
