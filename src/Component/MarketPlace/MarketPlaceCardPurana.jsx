// import React, { useState } from "react";
// import Swal from "sweetalert2";
// import { useHistory } from "react-router-dom";

// // css
// import "../../Css/SellItemCard.css";

// // redux
// import { useDispatch } from "react-redux";

// const MarketPlaceCard = (props) => {
//   const [inputValue, setInputValue] = useState("");

//   const dispatch = useDispatch();
//   const history = useHistory();

//   const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

//   // add to cart
//   const addToCart = () => {
//     if (apiKey) {
//       if (inputValue !== "" && Number(inputValue) > 0) {
//         // Add to cart logic here
//           name: props.name,
//           price: props.price,
//           quantity: inputValue,
//           totalPrice: Number(inputValue) * props.price,
//         });
        Swal.fire({
          title: "added to cart",
          confirmButtonColor: "#56b124",
        });
//       } else {
//         Swal.fire({
//           title: "add a quantity before add to cart",
//           confirmButtonColor: "#56b124",
//         });
//       }
//       setInputValue("");
//     } else {
//       Swal.fire({
//         title: "Signin to add to cart",
//         confirmButtonColor: "#56b124",
//       });
//       history.push("/signin");
//     }
//   };

//   return (
//     <div className="sell__item__card">
//       <img src={props.img} alt="" />
//       <div className="description">
//         <h1>{props.name}</h1>
//         <p>
//           Price : <span>{props.price} Rs/Kg</span>
//         </p>
//         <input
//           type="number"
//           placeholder="Quantity in Kg"
//           value={inputValue}
//           onChange={(e) => {
//             setInputValue(e.target.value);
//           }}
//         />
//         <button onClick={addToCart}>Add to cart</button>
//       </div>
//     </div>
//   );
// };

// export default MarketPlaceCard;
