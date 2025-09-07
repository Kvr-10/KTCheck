import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

// css
import "../../Css/JoinUsForm.css";

// material ui component
import { TextField } from "@mui/material";

// api url
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const JoinUsMentorForm = () => {
  const [disabledStatus,setDisabledStatus] = useState(false);

  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });

  // get input value
  const getInputValue = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  // join us
  const joinUs = async (e) => {
    setDisabledStatus(true);
    e.preventDefault();
    if(isNaN(inputValue.phone) || inputValue.phone.length !== 10)
    {
      Swal.fire({
        title: "Enter valid 10 digit phone number",
        confirmButtonColor: "#56b124",
      });
    }
    else if (
      inputValue.name !== "" &&
      inputValue.email !== "" &&
      inputValue.phone !== "" &&
      inputValue.linkedin !== ""
    ) {
      const linkedIn =
        // /((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))$/gm;
        /(https?)?:?(\/\/)?(([w]{3}||\w\w)\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      if (
        typeof inputValue.name === "string" &&
        !isNaN(inputValue.phone) &&
        inputValue.phone.length === 10 &&
        inputValue.linkedin.match(linkedIn)
      ) {
        try {
          const postUrl = USER_API_ENDPOINTS.INVESTOR_FORM;

          const data = new FormData();
          data.append("name", inputValue.name);
          data.append("email", inputValue.email);
          data.append("phone", inputValue.phone);
          data.append("linkedin_id", inputValue.linkedin);

          const headers = {
            "Content-Type": "multipart/form-data",
          };

          await axios.post(postUrl, data, headers);

          Swal.fire({
            title: "Thank You!",
            confirmButtonColor: "#56b124",
          });
          setInputValue({
            name: "",
            email: "",
            phone: "",
            linkedin: "",
          });
        } catch (err) {
          console.log(err);
          Swal.fire({
            title: "Enter valid email Id",
            confirmButtonColor: "#56b124",
          });
        }
      } else {
        Swal.fire({
          title: "Please Enter Valid Inputs",
          confirmButtonColor: "#56b124",
        });
      }
    }
    setDisabledStatus(false);
  };

  return (
    <form className="join__us__form" onSubmit={joinUs}>
      <div className="sub__section">
        <TextField
          className="input"
          type="text"
          label="Name"
          variant="outlined"
          name="name"
          required
          onChange={getInputValue}
          value={inputValue.name}
        />
        <TextField
          className="input"
          type="email"
          label="Email ID"
          variant="outlined"
          name="email"
          required
          onChange={getInputValue}
          value={inputValue.email}
        />
      </div>
      <div className="sub__section">
        <TextField
          className="input"
          type="tel"
          label="Phone Number"
          variant="outlined"
          name="phone"
          required
          onChange={getInputValue}
          value={inputValue.phone}
        />
        <TextField
          className="input"
          type="url"
          label="LinkedIn ID"
          variant="outlined"
          name="linkedin"
          required
          onChange={getInputValue}
          value={inputValue.linkedin}
        />
      </div>
      <button type="submit" disabled={disabledStatus}>Join Us</button>
    </form>
  );
};

export default JoinUsMentorForm;
