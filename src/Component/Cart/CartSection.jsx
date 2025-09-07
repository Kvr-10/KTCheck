import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

// redux
import { useSelector, useDispatch } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";

// css
import "../../Css/Cart.css";

// component
import Navbar from "../Navbar";
import UserProfileSearchbar from "../UserProfileSearchbar";
import UserProfileNavbar from "../User/UserProfileNavbar";
import CartStep1 from "./CartStep1";
import CartStep2 from "./CartStep2";
import CartStep3 from "./CartStep3";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";

// utils
import { USER_API_ENDPOINTS } from "../../utils/apis";

const CartSection = () => {
  const dispatch = useDispatch();
  const cartStep = useSelector((state) => state.stepReducer.cartStep);

  const history = useHistory();

  const [cartDetails, setCartDetails] = useState([]);
  const customerId = JSON.parse(localStorage.getItem("KTMauth"))?.customer_id;

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        if (!customerId) {
          console.error("Customer ID is missing");
          return;
        }

        const response = await axios.get(
          `${USER_API_ENDPOINTS.VIEW_CART}${customerId}`
        );
        console.log("Cart details:", response.data);
        setCartDetails(response.data);
      } catch (error) {
        console.error("Error fetching cart details:", error);
      }
    };

    fetchCartDetails();
  }, [customerId]);

  return (
    <>
      <Navbar />

      <UserProfileSearchbar />
      <UserProfileNavbar />

      {(() => {
        if (cartDetails.length > 0) {
          if (cartStep === 1) {
            return <CartStep1 cartDetails={cartDetails} />;
          }
          if (cartStep === 2) {
            return <CartStep2 cartDetails={cartDetails} />;
          }
          if (cartStep === 3) {
            return <CartStep3 cartDetails={cartDetails} />;
          }
        } else {
          return (
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
          );
        }
      })()}

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default CartSection;
