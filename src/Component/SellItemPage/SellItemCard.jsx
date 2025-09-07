import React, { useState } from "react";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import axios from "axios";

// css
import "../../Css/SellItemCard.css";

// redux
import { useDispatch, useSelector } from "react-redux";
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";
const SellItemCard = (props) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  // ✅ Check if item is already in the fetched cart
  const isInCart = props.fetchedCartItems?.some(item => item.price_list === props.price_id);

  const addToCart = () => {
    if (apiKey) {
      if (inputValue !== "" && Number(inputValue) > 0) {
        const formData = new FormData();
        formData.append("customer", apiKey.customer_id);
        formData.append("price_list", props.price_id);
        formData.append("subcategory_name", props.name);
        formData.append("unit", props.unit);
        formData.append("quantity", inputValue);
        formData.append("price", props.price);
        formData.append("cart", 1);

        // Use the actual endpoint URL
        axios.post(USER_API_ENDPOINTS.ADD_ITEM_CART, formData)
          .then((res) => {
            // console.log("✅ Item added to backend cart:", res.data);
            
            // Create cart order ID after successfully adding item to cart
            const orderFormData = new FormData();
            orderFormData.append("customer_id", apiKey.customer_id);
            orderFormData.append("dealer_id", props.dealer);
            
            return axios.post(USER_API_ENDPOINTS.ADD_ORDER_FOR_CART_ORDER_ID, orderFormData);
          })
          .then((orderRes) => {
            // console.log("✅ Cart order created:", orderRes.data);
            Swal.fire({
              title: "Success!",
              text: "Item added to cart successfully!",
              icon: "success",
              confirmButtonColor: "#56b124",
              timer: 1000,
              showConfirmButton: false
            });
            props.onItemAddToCart({
              price_list: props.price_id,
              quantity: inputValue,
              subcategory_name: props.name,
              unit: props.unit,
              price: props.price,
              cart_order_id: orderRes.data.cart_order_id,
            });
          })
          .catch((err) => {
            // console.error("❌ Error in cart operations:", err.response || err);
            Swal.fire({
              title: "Error!",
              text: "Error adding item to cart. Please try again.",
              icon: "error",
              confirmButtonColor: "#56b124",
              timer: 1000,
            });
          });
      } else {
        Swal.fire({
          title: "Add a quantity before add to cart",
          confirmButtonColor: "#56b124",
        });
      }
      setInputValue("");
    } else {
      Swal.fire({
        title: "Please Signin to add to cart",
        confirmButtonColor: "#56b124",
      });
      history.push("/signin");
    }
  };

  return (
    <div className="sell__item__card">
      <img src={`${apiUrl}/${props.img}`} alt={props.name} />
      <div className="description">
        <h1>{props.name}</h1>
        <p>
          Price : <span>{props.price} Rs/Kg</span>
        </p>
        {!props.isDealer && (
          <>
            <input
              type="number"
              placeholder="Quantity in Kg"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isInCart} // ✅ Disable input if already in cart
            />
            <button
              onClick={addToCart}
              disabled={isInCart}
              style={{
                backgroundColor: isInCart ? "#ccc" : "#56b124",
                color: isInCart ? "#666" : "#fff",
                cursor: isInCart ? "not-allowed" : "pointer"
              }}
            >
              {isInCart ? "Item in Cart" : "Add to cart"}
            </button>
          </>
        )}
        {props.isDealer && (
          <p style={{ color: "#56b124", fontWeight: "bold", marginTop: "10px" }}>
            Dealer View
          </p>
        )}
      </div>
    </div>
  );
};

export default SellItemCard;
