import React, { useState } from "react";
import axios from "axios";
// import Swal from "sweetalert2";

// material ui component
import { TextField } from "@mui/material";

// css
import "../../Css/Auth.css";

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../Redux/stepReducer";

// api url
import { apiUrl, apiUrl1 } from "../../Private";
import Swal from "sweetalert2";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const ForgotPasswordStep1 = () => {
  const dispatch = useDispatch();
  const [tabBtn, setTabBtn] = useState('customer');

  const [inputValue, setInputValue] = useState({
    email: "",
  });
  console.log("forgetPassword")
  // get input value
  const getInputValue = (e) => {
    setInputValue({
      ...inputValue,
      [e.target.name]: e.target.value,
    });
  };

  // next forgot ----------------------------------------------
  const nextForgot = async (e) => {
    e.preventDefault();
    if (inputValue.email !== "") {
      let password_reset = USER_API_ENDPOINTS.RESET_PASSWORD_GENERATION;
      let data = new FormData();
      data.append("email", inputValue.email);
      // Password Reset-----------------------------------------
      try {
          await axios.post(password_reset, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })
        setInputValue({
          email: "",
        });
        dispatch(stepReducerActions.forward("forgotPasswordStep"));
      }
      catch (err) {

        console.log(err)
        // if (err.response.status === 302) {
        //   //user exist...send forgot password link
        //   let forgotUrl = `${apiUrl}/v3/api/request-password-reset-email/${tabBtn}/`;
        //   // forgot url
        //   await axios.post(forgotUrl, data, {
        //     headers: {
        //       "Content-Type": "multipart/form-data",
        //     },
        //   });
        //   setInputValue({
        //     email: "",
        //   });
        //   dispatch(stepReducerActions.forward("forgotPasswordStep"));
        // }
        // else 
        

        // no use by Aryan
        if(err.response.data.message === "Please firstly verify your email. Mail sent to your email!!")
        {
        const activate = new FormData();
        activate.append("email", inputValue.email);
        try {
          axios.post(`${apiUrl}/v3/api/regenerate-verification-email/${tabBtn}`, activate, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
          })
        }
        catch (err) {
          Swal.fire({
            title: "Error in sending regeneration link",
            confirmButtonColor: "#56b124",
          })
        }
        Swal.fire({
          title: "Account with this email Exists.Activation Link sent!! Please Verify your email and then request for password change",
          confirmButtonColor: "#56b124",
          icon: "success",
        });
        }
        else {
          Swal.fire({
            title: "Email id not registered",
            confirmButtonColor: "#56b124",
          })
        }
      }
    }
};

return (
  <div className="section">
    <h1>Password Reset</h1>

    <form className="form" onSubmit={nextForgot}>
      <p className="form__top__text">
        Type your email address below and we will send you an OTP on your email with
        instruction on how to reset your password.
      </p>
      <div className="forget__type__btns">
        <button
          className={`forget__type ${'customer' === tabBtn ? 'active' : ''}`}
          key={`customer Button`}
          onClick={() => setTabBtn('customer')}
        >
          Customer
        </button>
        <button
          className={`forget__type ${'dealer' === tabBtn ? 'active' : ''}`}
          key={`dealer Button`}
          onClick={() => setTabBtn('dealer')}
        >
          Dealer
        </button>
      </div>
      <TextField
        className="input"
        type="email"
        label="Email"
        variant="outlined"
        name="email"
        required
        onChange={getInputValue}
        value={inputValue.email}
      />
      <button className="form__button" type="submit">Send email</button>
      {/* <div className="forget_btns">
          <button className="form__button" type="submit" onClick={(e) => { nextForgot(e, "customer") }}>
            Customer
          </button>
          <button className="form__button" type="submit" onClick={(e) => { nextForgot(e, "dealer") }}>
            Dealer
          </button>
        </div> */}
    </form>
  </div>
);
};

export default ForgotPasswordStep1;
