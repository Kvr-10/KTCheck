import React, { useState } from "react";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import axios from "axios";

// css
import "../../Css/SellItemCard.css";

// redux
import { useDispatch } from "react-redux";

// utils
import { USER_API_ENDPOINTS } from "../../utils/apis";

const MarketPlaceSellCard = (props) => {
  const [inputValue, setInputValue] = useState("");

  const dispatch = useDispatch();
  const history = useHistory();

  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  // add to cart
  const addToCart = () => {
    if (apiKey) {
      if (inputValue !== "" && Number(inputValue) > 0) {
        const formData = new FormData();
        formData.append("customer", apiKey.customer_id);
        formData.append("price_list", props.price_id || 1); // Use price_id from props
        formData.append("subcategory_name", props.name);
        formData.append("unit", "kg"); // Default unit
        formData.append("quantity", inputValue);
        formData.append("price", props.price);
        formData.append("cart", 1);

        axios.post(USER_API_ENDPOINTS.ADD_ITEM_CART, formData)
          .then((res) => {
            console.log("✅ Item added to backend cart:", res.data);
            
            // Create cart order ID after successfully adding item to cart
            const orderFormData = new FormData();
            orderFormData.append("customer_id", apiKey.customer_id);
            orderFormData.append("dealer_id", props.dealer || 1); // Use dealer from props
            
            return axios.post(USER_API_ENDPOINTS.ADD_ORDER_FOR_CART_ORDER_ID, orderFormData);
          })
          .then((orderRes) => {
            console.log("✅ Cart order created:", orderRes.data);
            Swal.fire({
              title: "Added to cart",
              confirmButtonColor: "#56b124",
              timer: 2000,
              showConfirmButton: false
            });
          })
          .catch((err) => {
            console.error("❌ Error adding item to cart:", err.response || err);
            Swal.fire({
              title: "Failed to add to cart",
              text: "Please try again",
              confirmButtonColor: "#56b124",
            });
          });
      } else {
        Swal.fire({
          title: "add a quantity before add to cart",
          confirmButtonColor: "#56b124",
        });
      }
      setInputValue("");
    } else {
      Swal.fire({
        title: "Signin to add to cart",
        confirmButtonColor: "#56b124",
      });
      history.push("/signin");
    }
  };

  return (
    <div className="sell__item__card">
      <img src={props.img} alt="" />
      <div className="description">
        <h1>{props.name}</h1>
        <p>
          Price : <span>{props.price} Rs/Kg</span>
        </p>
        <input
          type="number"
          placeholder="Quantity in Kg"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <button onClick={addToCart}>Add to cart</button>
      </div>
    </div>
  );
};

export default MarketPlaceSellCard;
