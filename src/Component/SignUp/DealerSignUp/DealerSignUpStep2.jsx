import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import axios from 'axios';
import Swal from "sweetalert2";

// material ui component
// import Visibility from "@material-ui/icons/Visibility";
// import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// css
import "../../../Css/Auth.css";

//no changing now !!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!!!!

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../../Redux/stepReducer";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const DealerSignUpStep2 = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [inputValue, setInputValue] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    password1: false,
    password2: false,
  });

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get input value
  const getInputValue = (e) => {
    setInputValue({
      ...inputValue,
      [e.target.name]: e.target.value,
    });
  };

  // next step
  const nextStep = async (e) => {
    e.preventDefault();

    if (
      typeof inputValue.fullName === "string" &&
      !isNaN(inputValue.mobileNumber) &&
      inputValue.mobileNumber.length === 10
    ) {
      if (
        inputValue.password.length >= 8 &&
        inputValue.password === inputValue.confirmPassword
      ) {

        const infos = JSON.parse(localStorage.getItem("KTMinfo"));
        localStorage.setItem("KTMinfo", JSON.stringify(infos));

        const data = new FormData();
        data.append("full_name", inputValue.fullName);
        data.append("email", inputValue.email);
        data.append("password", inputValue.password);
        data.append("password2",inputValue.confirmPassword)
        data.append("phone_number", inputValue.mobileNumber);
       data.append("account_role", infos["userType"]);
        data.append("account_type", "Dealer");

        if (infos["userType"] === "kabadiwala")
          data.append("profile_type", "Kabadi");
        else if (infos["userType"] === "collector")
          data.append("profile_type", "Collector");
        else if (infos["userType"] === "recycler")
          data.append("profile_type", "Recycler");


        axios.post(USER_API_ENDPOINTS.SIGNUP_API, data)
          .then((res) => {
            console.log(res)

            // email not verified  -part of login now - kirti
            // if (res.data.msg === 'your unverified account already exists!') {
            //   // logic for sending regenerate verification email
            //   axios.post(`${apiUrl}/v3/api/regenerate-verification-email/dealer/`, {
            //     email: inputValue.email
            //   })
            //     .then((res) => {
            //       console.log(res)
            //       Swal.fire({
            //         title: "Account exist but email is not verified. Activation link sent to your mail. Please verify your email",
            //         confirmButtonColor: "#56b124"
            //       })
            //     }).catch((err) => {
            //       console.log(err)
            //     })
            // }

            // user already exists
            // else 

            // registration successs
            // else {
              // recieve success response from backend
              if (res.status === 201) {
                localStorage.removeItem("KTMinfo");
                dispatch(stepReducerActions.reset("dealerSignUpStep"));

                Swal.fire({
                  title: "Verification email sent",
                  confirmButtonColor: "#56b124",
                });
                setInputValue({
                  fullName: "",
                  email: "",
                  mobileNumber: "",
                  password: "",
                  confirmPassword: "",
                });

                history.push("/signin");
              }
              // ------------------------------------------------------
              // dispatch(stepReducerActions.forward("customerSignUpPersonalStep"));
            // }

          }).catch((err) => {
            console.log(err);
            // User Already Exist
            if (err.response.data.error === 'User already exists as Customer please login for the same account type'
              || err.response.data.error === 'User already exists as Dealer please login for the same account type'
            ) {
              Swal.fire({
                title: "Verified account exist. You can signin with this account.",
                confirmButtonColor: "#56b124"
              })
              history.push('/signin')
            }
          })
      }
      else {
        Swal.fire({
          title: "passwords must be same and more than 8 characters",
          confirmButtonColor: "#56b124",
        });
      }
    }
    else {
      Swal.fire({
        title: "Enter 10-digit mobile number and valid username and email",
        confirmButtonColor: "#56b124",
      });
    }
    
  };

  return (
    <div className="section">
      <h1>Sign Up</h1>

      <form className="form" onSubmit={nextStep}>
        <TextField
          className="input"
          type="text"
          label="Your Name"
          variant="outlined"
          name="fullName"
          value={inputValue.fullName}
          onChange={getInputValue}
          required
        />
        <TextField
          className="input"
          type="email"
          label="Your Email"
          variant="outlined"
          name="email"
          value={inputValue.email}
          onChange={getInputValue}
          required
        />
        <TextField
          className="input"
          type="text"
          label="Your Mobile Number"
          variant="outlined"
          name="mobileNumber"
          value={inputValue.mobileNumber}
          onChange={getInputValue}
          required
        />
      <FormControl variant="outlined" className="form__control">
        <InputLabel>Password</InputLabel>
        <OutlinedInput
          required
          label="Password"
          className="input"
          type={showPassword.password1 ? "text" : "password"}
          value={inputValue.password}
          name="password"
          onChange={getInputValue}
          endAdornment={
            <InputAdornment position="end"> {/* <-- Ensure position is specified */}
              <IconButton
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    password1: !prev.password1,
                  }))
                }
                edge="end"
              >
                {showPassword.password1 ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      <FormControl variant="outlined" className="form__control">
        <InputLabel>Confirm Password</InputLabel>
        <OutlinedInput
          required
          label="Confirm Password"
          className="input"
          type={showPassword.password2 ? "text" : "password"}
          value={inputValue.confirmPassword}
          name="confirmPassword"
          onChange={getInputValue}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setShowPassword({
                    ...showPassword,
                    password2: !showPassword.password2,
                  });
                }}
                edge="end"
              >
                {showPassword.password2 ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

        <p className="signup__agreement">
          <input type="checkbox" required /> I have read and agree to the{" "}
          <NavLink
            exact
            to="/privacypolicy"
            className="signup__agreement__link"
            target="_blank"
          >
            Privacy Policy
          </NavLink>{" "}
          and{" "}
          <NavLink
            exact
            to="/termsconditions"
            className="signup__agreement__link"
            target="_blank"
          >
            Terms & Conditions
          </NavLink>
        </p>
        <button className="form__button" type="submit">
          Submit
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <NavLink className="signin__link" to="/signin">
          Sign In
        </NavLink>
      </p>
    </div>
  );
};

export default DealerSignUpStep2;
