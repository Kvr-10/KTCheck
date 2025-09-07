import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

// css
import "../../Css/JoinUsForm.css";

// material ui component
import { TextField , Select , FormControl } from "@mui/material";

// api url
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const JoinUsInternForm = () => {
  const [disabledStatus,setDisabledStatus] = useState(false);
  // const [phoneError,setPhoneError] = useState(false);
  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    option: "",
    file: "",
  });

  // get input value
  const getInputValue = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  // get file
  const getFile = (e) => {
    setInputValue({ ...inputValue, file: e.target.files[0] });
  };

  // join us
  const joinUs = async (e) => {
    setDisabledStatus(true);
    e.preventDefault();
    if(isNaN(inputValue.phone) || inputValue.phone.length !== 10)
    {
      // setPhoneError(true);
      Swal.fire({
        title: "Enter valid 10 digit phone number",
        confirmButtonColor: "#56b124",
      });
    }
    else if (
      inputValue.name !== "" &&
      inputValue.email !== "" &&
      inputValue.phone !== "" &&
      inputValue.linkedin !== "" &&
      inputValue.option !== "" &&
      inputValue.file !== ""
    ) {
      if (inputValue.file.type === "application/pdf") {
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
            const postUrl = USER_API_ENDPOINTS.INTERN_FORM;

            const data = new FormData();
            data.append("name", inputValue.name);
            data.append("email", inputValue.email);
            data.append("phone", inputValue.phone);
            data.append("linkedin_id", inputValue.linkedin);
            data.append("domain", inputValue.option);
            data.append("cv", inputValue.file);
            console.log(inputValue.file);

            const headers = {
              "Content-Type": "multipart/form-data",
            };

            await axios.post(postUrl, data, headers);

            Swal.fire({
              title: "We recieved your application. \n Thank you!",
              confirmButtonColor: "#56b124",
            });
            // setPhoneError(false);
            setInputValue({
              name: "",
              email: "",
              phone: "",
              linkedin: "",
              option: "",
              file: "",
            });
          } catch (err) {
            console.log(err);
            Swal.fire({
              title: "enter valid email Id",
              confirmButtonColor: "#56b124",
            });
          }
        } else {
          Swal.fire({
            title: "Please Enter Valid Inputs",
            confirmButtonColor: "#56b124",
          });
        }
      } else {
        setInputValue({ ...inputValue, file: "" });
        Swal.fire({
          title: "Please upload .pdf file",
          confirmButtonColor: "#56b124",
        });
      }
    }
    else {
      Swal.fire({
        title: "Please fill all fields",
        confirmButtonColor: "#56b124",
      });
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
          // className={phoneError ? "erroredInput" : "input"}
          type="tel"
          label="Phone Number(10-digit)"
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
      <div className="sub__section">
        <FormControl variant="outlined" className="input">
          <Select
            native
            required
            onChange={getInputValue}
            name="option"
            value={inputValue.option}
          >
            <option value="">Select field</option>
            <option value={"finance"}>Finance</option>
            <option value={"web development"}>Web development</option>
            <option value={"app development"}>App development</option>
            <option value={"graphics designing"}>Graphics designing</option>
            <option value={"business development"}>Business development</option>
            <option value={"marketing"}>Marketing</option>
            <option value={"advertisement"}>Advertisement</option>
            <option value={"chemical r&d"}>Chemical R&D</option>
            <option value={"IoT development"}>IoT development</option>
            <option value={"others"}>Others</option>
          </Select>
        </FormControl>
        <label
          htmlFor="file"
          style={
            inputValue.file === ""
              ? { backgroundColor: "#ff7373" }
              : { backgroundColor: "#35ce72" }
          }
        >
          {inputValue.file === "" ? "Upload Your CV (.pdf)" : "CV Uploaded"}
        </label>
        <input
          style={{ display: "none" }}
          id="file"
          type="file"
          name="file"
          accept="application/pdf"
          onChange={getFile}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
      </div>
      <button type="submit" disabled={disabledStatus}>Join Us</button>
    </form>
  );
};

export default JoinUsInternForm;
