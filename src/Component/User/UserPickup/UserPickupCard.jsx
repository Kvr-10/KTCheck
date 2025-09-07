// import axios from "axios";
// import React from "react";
// import Swal from "sweetalert2";

// // css
// import "../../../Css/UserDealerPickupCard.css";

// // image
// import pickup__truck from "../../../Image/pick-up-truck.png";
// import { apiUrl } from "../../../Private";
// import { useHistory } from "react-router-dom";

// const UserDealerPickupCard = (props) => {

//   const history = useHistory()

//   const cancelPickup = () => {
//     const data = new FormData()
//     data.append('status', 'Cancelled by Customer')
//     axios.patch(`${apiUrl}/api/order_confirm/${props.order_no}/`, data)
//       .then((res) => {
//         console.log(res)
//         Swal.fire({
//           title: "Order Cancelled",
//           confirmButtonColor: "#56b124"
//         })
//         history.push('/sell/user/profile')
//       }).catch((err) => {
//         console.log(err)
//       })
//   }
//   return (
//     <div className="user__dealer__pickup__card">
//       <div className="left__side">
//         <img src={pickup__truck} alt="" />
//       </div>
//       <div className="right__side">
//         <p>
//           Order_no : <span>{props.order_no}</span>
//         </p>
//         <p>
//           On : <span>{props.date.slice(0, 10)}</span>
//         </p>
//         <p>
//           Total Cart Items : <span>{props.total_cart_items}</span>
//         </p>
//         <p>
//           Total Amount : <span>{props.total_amount} Rs.</span>
//         </p>
//         <p>
//           Status : <span>{props.status}</span>
//         </p>
//         {props.status === 'Cancelled by Dealer' || props.status === 'Cancelled by Customer' ? <></> :
//           <div className="pickup__btns">
//             <button onClick={cancelPickup}>Cancel</button>
//           </div>
//         }
//       </div>
//     </div>
//   );
// };

// export default UserDealerPickupCard;
