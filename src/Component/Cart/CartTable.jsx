// css
import "../../Css/Cart.css";

// SweetAlert2
import Swal from "sweetalert2";

// material icon
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

// redux
import { useSelector, useDispatch } from "react-redux";

import { useHistory } from "react-router-dom";
import { stepReducerActions } from "../../Redux/stepReducer";
import axios from "axios";

import { USER_API_ENDPOINTS } from "../../utils/apis";

import React, { useEffect, useState } from "react"; // Add useEffect

const CartTable = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem('KTMauth'));

  const [fetchedCart, setFetchedCart] = useState([]); // To store cart items
  const [totals, setTotals] = useState(null); // To store grand total and summary

  useEffect(() => {
    const customerId = apiKey.customer_id;
    axios.get(`${USER_API_ENDPOINTS.VIEW_CART}${customerId}/`)
      .then((res) => {
        const data = res.data;
        const items = data.slice(0, -1); // All except last
        const summary = data[data.length - 1]; // Last object = total
        setFetchedCart(items);
        setTotals(summary);
      })
      .catch((err) => {
        console.error("❌ Error fetching cart:", err.response || err);
        Swal.fire({
          title: "Error!",
          text: "Error fetching cart",
          icon: "error",
          confirmButtonColor: "#56b124"
        });
      });
  }, []);

  // delete cart item
const deleteCartItem = (itemId) => {
  axios.delete(`${USER_API_ENDPOINTS.DELETE_ITEM_CART_BY_ID}${itemId}/`)
    .then((res) => {
      Swal.fire({
        title: "Success!",
        text: "Item deleted from cart",
        icon: "success",
        confirmButtonColor: "#56b124",
        timer: 1000,
        showConfirmButton: false
      });
      refreshCart(); // Refresh the cart after deletion
    })
    .catch((err) => {
      console.error("❌ Error deleting cart item:", err.response || err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete item from cart",
        icon: "error",
        confirmButtonColor: "#56b124"
      });
    });
};

// clear all cart items via API
const clearCartItems = async () => {
  try {
    for (const item of fetchedCart) {
      await axios.delete(`${USER_API_ENDPOINTS.DELETE_ITEM_CART_BY_ID}${item.id}/`);
    }
    Swal.fire({
      title: "Success!",
      text: "Cart cleared successfully!",
      icon: "success",
      confirmButtonColor: "#56b124",
      timer: 1000,
      showConfirmButton: false
    });
    setFetchedCart([]);
    setTotals(null);
  } catch (err) {
    console.error("❌ Error clearing cart:", err.response || err);
    Swal.fire({
      title: "Error!",
      text: "Failed to clear cart",
      icon: "error",
      confirmButtonColor: "#56b124"
    });
  }
};



const submitCartData = () => {
  if (fetchedCart.length <= 10) {
    dispatch(stepReducerActions.forward("cartStep"));
  } else {
    Swal.fire({
      title: "Cart Limit Reached!",
      text: "Only 10 items are allowed in an order!",
      icon: "warning",
      confirmButtonColor: "#56b124"
    });
  }
};

// Increase quantity
const incrementQuantity = async (cartItemId, currentQty) => {
  const body = {
    id: cartItemId, // Use the correct cart item ID
    quantity: 1, // Increment the quantity
  };

  try {
    await axios.post(USER_API_ENDPOINTS.ADD_QUANTITY_ITEM_CART, body);
    Swal.fire({
      title: "Success!",
      text: "Quantity increased",
      icon: "success",
      confirmButtonColor: "#56b124",
      timer: 1000,
      showConfirmButton: false
    });
    refreshCart();
  } catch (err) {
    console.error("❌ Error increasing quantity:", err.response || err);
    Swal.fire({
      title: "Error!",
      text: "Failed to increase quantity",
      icon: "error",
      confirmButtonColor: "#56b124"
    });
  }
};

// Decrease quantity
const decrementQuantity = async (cartItemId, currentQty) => {
  const body = {
    id: cartItemId, // Use the correct cart item ID
    quantity: currentQty - 1, // Decrement the quantity
  };

  try {
    await axios.post(USER_API_ENDPOINTS.SUB_QUANTITY_ITEM_CART, body);
    Swal.fire({
      title: "Success!",
      text: "Quantity decreased",
      icon: "success",
      confirmButtonColor: "#56b124",
      timer: 1000,
      showConfirmButton: false
    });
    refreshCart();
  } catch (err) {
    console.error("❌ Error decreasing quantity:", err.response || err);
    Swal.fire({
      title: "Error!",
      text: "Failed to decrease quantity",
      icon: "error",
      confirmButtonColor: "#56b124"
    });
  }
};

// Refresh cart
const refreshCart = () => {
  const customerId = apiKey.customer_id;
  axios.get(`${USER_API_ENDPOINTS.VIEW_CART}${customerId}/`)
    .then((res) => {
      const data = res.data;
      const items = data.slice(0, -1);
      const summary = data[data.length - 1];
      setFetchedCart(items);
      setTotals(summary);
    })
    .catch((err) => {
      console.error("❌ Error refreshing cart:", err.response || err);
      Swal.fire({
        title: "Error!",
        text: "Error refreshing cart",
        icon: "error",
        confirmButtonColor: "#56b124"
      });
    });
};



return (
  <>
    {fetchedCart.length > 0 ? (
      <>
        <div className="cart__table">
          <p>(Scroll left-right to see the full table)</p>
          <table>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Scrap Name</th>
                <th>Price</th>
                <th>Approx. Quantity</th>
                <th>Approx. Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fetchedCart.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.subcategory_name}</td>
                  <td>{item.price} Rs/Kg</td>
                  <td>
                    <button
                      onClick={() => decrementQuantity(item.id, item.quantity)}
                      disabled={item.quantity <= 1}
                      className="qtyBtn"
                    >
                      <IndeterminateCheckBoxIcon />
                    </button>
                    <span className="qtyVal">{item.quantity} kg</span>
                    <button
                      onClick={() => incrementQuantity(item.id, item.quantity)}
                      className="qtyBtn"
                    >
                      <AddBoxIcon />
                    </button>
                  </td>
                  <td>{item.subtotal} Rs</td>
                  <td>
                    <button onClick={() => deleteCartItem(item.id)} className="delete-btn">
                      <DeleteForeverIcon />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="grand-total-row">
                <td colSpan="4" className="grand-total-label">Approx. Grand Total</td>
                <td className="grand-total-value">{totals?.grand_total || 0} Rs</td>
                <td>
                  <button onClick={clearCartItems} className="delete-btn">
                    <DeleteForeverIcon />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className="cart__button"
          onClick={submitCartData}
        >
          Next
        </button>
      </>
    ) : (
      <div className="empty__cart">
        <h1>Your cart is empty</h1>
        <button
          className="cart__button"
          onClick={() => {
            dispatch(stepReducerActions.reset("cartStep"));
            history.push("/sell");
          }}
        >
          Go to sell page
        </button>
      </div>
    )}
  </>
);
};


export default CartTable;
