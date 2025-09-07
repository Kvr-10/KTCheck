import React, { useState, useEffect } from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// material ui component
import { TextField } from "@mui/material";

// css
import "../../../Css/Auth.css";

// redux
import { useDispatch } from "react-redux";
import { stepReducerActions } from "../../../Redux/stepReducer";

// api url
import { apiUrl } from "../../../Private";

// profilepic
// import profilepic from '../../../Image/email-bg.png';

const SignUpAddressInfoStep = () => {
  const [inputValue, setInputValue] = useState({
    areaPincode: "",
    state: "",
    city: "",
    address: "",
  });

  // const [ProfilePic, setProfilePic] = useState(null);
  const [active, setActive] = useState(true);
  const [userType, setUserType] = useState('customer')
  const [disabledStatus, setDisabledStatus] = useState(false)

  const dispatch = useDispatch();

  const history = useHistory();
  const location = useLocation();

  const infos = JSON.parse(localStorage.getItem("KTMinfo"))

  // get userType 
  useEffect(() => {
    if (infos["isDealer"] === true)
      setUserType('dealer')
  }, [infos])

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

  // get pincode detail
  const getPincodeDetail = async (e) => {
    if (inputValue.areaPincode !== "") {
      if (e.key === "Tab") {
        try {
          const response = await axios.get(
            `https://api.postalpincode.in/pincode/${inputValue.areaPincode}`
          );

          if (response.data[0].PostOffice !== null) {
            setInputValue({
              ...inputValue,
              state: response.data[0].PostOffice[0].State,
              city: response.data[0].PostOffice[0].District,
            });
          }
          else
            Swal.fire({
              title: "Please enter valid pincode",
              confirmButtonColor: "#56b124"
            })
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  // sign up
  const signUp = async (e) => {
    setDisabledStatus(true)
    e.preventDefault();
    // send response to backend
    // commented by Aryan
    // try {
    //   const infos = JSON.parse(localStorage.getItem("KTMinfo"));

    //   let registrationUrl = `${apiUrl}/v3/api/registration/${userType}/`;

    //   try {
    //     const res = await axios.get(
    //       `${apiUrl}/v3/api/database-checker/${userType}/${infos["email"]}/`
    //     );
    //   }
    //   catch (err) {
    //     console.log(err.message);
    //     console.log(err);
    //     if (err.message === "Please firstly verify your email. Mail sent to your email!!") {
    //       setActive(false);
    //       Swal.fire({
    //         title: "User Exists. Please verify your email and signin",
    //         confirmButtonColor: "#56b124",
    //       })
    //     }
    //   }

    //   if (active) {
    //     const data = new FormData();
    //     data.append("username", infos["name"]);
    //     data.append("email", infos["email"]);
    //     data.append("password", infos["password"]);
    //     data.append("mobile_number", infos["phone"]);
    //     if (userType === 'customer') {
    //       data.append("role", infos["userType"]);
    //       data.append("account_category", userType);
    //     }

    //     if (infos["isPersonalAccount"] === true)
    //       data.append("account_type", "Personal");
    //     else if (infos["isOrganizationAccount"] === true)
    //       data.append("account_type", "Organization");

    //     if (infos["userType"] === "kabadiwala")
    //       data.append("account_type", "Kabadi");
    //     else if (infos["userType"] === "collector")
    //       data.append("account_type", "Collector");
    //     else if (infos["userType"] === "recycler")
    //       data.append("account_type", "Recycler");
    //     data.append("ProfilePic", "");

    //     const response = await fetch(registrationUrl, {
    //       method: "POST",
    //       body: data,
    //       "Content-type": "multipart/form-data",
    //     });

    //     console.log(response);

    //     // recieve success response from backend
    //     if (response.ok) {
    //       setInputValue({
    //         areaPincode: "",
    //         state: "",
    //         city: "",
    //         address: "",
    //       });

    //       localStorage.removeItem("KTMinfo");

    //       dispatch(stepReducerActions.reset("customerSignUpPersonalStep"));
    //       dispatch(stepReducerActions.reset("customerSignUpOrganizationStep"));
    //       dispatch(stepReducerActions.reset("dealerSignUpStep"));

    //       Swal.fire({
    //         title: "Verification email sent",
    //         confirmButtonColor: "#56b124",
    //       });

          
    //       history.push("/signin");
    //     }
    //     // recieve failure response from backend
    //     else {
    //       const jsonResponse = await response.json();

    //       let error = "";
    //       for (let item in jsonResponse) {
    //         error += `${jsonResponse[item][0]}\n`;
    //       }

    //       setInputValue({
    //         areaPincode: "",
    //         state: "",
    //         city: "",
    //         address: "",
    //       });

    //       dispatch(stepReducerActions.reset("customerSignUpPersonalStep"));
    //       dispatch(stepReducerActions.reset("customerSignUpOrganizationStep"));
    //       dispatch(stepReducerActions.reset("dealerSignUpStep"));

    //       Swal.fire({
    //         title: error,
    //         confirmButtonColor: "#56b124",
    //       });
    //       // history.push("/signin/signup");
    //     }
    //   }
    // } catch (err) {
    //   console.log(err);
    // }
    setDisabledStatus(false)
  };

  return (
    <div className="section">
      <h1>Sign Up</h1>
      <p style={{ marginTop: "0", fontSize: "1rem" }} className="section__tab">
        (Add pincode & press TAB key to autocomplete other fileds)
      </p>

      <form className="form" onSubmit={signUp}>
        <TextField
          className="input"
          type="text"
          label="Your Area Pin Code"
          variant="outlined"
          name="areaPincode"
          value={inputValue.areaPincode}
          onChange={getInputValue}
          onKeyDown={getPincodeDetail}
          required
        />
        <TextField
          className="input"
          type="text"
          label="Your State"
          variant="outlined"
          name="state"
          value={inputValue.state}
          onChange={getInputValue}
          required
        />
        <TextField
          className="input"
          type="text"
          label="Your City"
          variant="outlined"
          name="city"
          value={inputValue.city}
          onChange={getInputValue}
          required
        />
        <TextField
          className="input"
          type="text"
          label="Your Address"
          variant="outlined"
          name="address"
          value={inputValue.address}
          onChange={getInputValue}
          required
        />
        {/* <input
          type="file"
          name="ProfilePic"
          value = {ProfilePic}
          onChange={(e) => setProfilePic(e.target.files[0])}
        /> */}
        <div>
          <button
            className="form__button"
            onClick={() => {
              switch (location.pathname) {
                case "/signin/signup/customer/personal":
                  dispatch(
                    stepReducerActions.backward("customerSignUpPersonalStep")
                  );
                  break;
                case "/signin/signup/customer/organization":
                  dispatch(
                    stepReducerActions.backward(
                      "customerSignUpOrganizationStep"
                    )
                  );
                  break;
                case "/signin/signup/dealer":
                  dispatch(stepReducerActions.backward("dealerSignUpStep"));
                  break;
                default:
                  break;
              }
            }}
          >
            Back
          </button>
          <button className="form__button" type="submit" disabled={disabledStatus}>
            Sign Up
          </button>
        </div>
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

export default SignUpAddressInfoStep;
