import React, { useState } from "react";
import axios from "axios";
import { TextField } from "@mui/material";
import "../../../Css/Auth.css";
import Swal from "sweetalert2";
import { USER_API_ENDPOINTS } from "../../../utils/apis";
import { getAccessTokenFromRefresh } from "../../../utils/helper";
import RightBanner from "../../AuthPageBanner/RightBanner";
import Navbar from "../../Navbar";
import { useHistory } from "react-router-dom";

const ChangePassword = () => {
  const [inputValue, setInputValue] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const history = useHistory();

  // get input value
  const getInputValue = (e) => {
    setInputValue({
      ...inputValue,
      [e.target.name]: e.target.value,
    });
  };

  // handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (
      inputValue.old_password &&
      inputValue.new_password &&
      inputValue.confirm_new_password
    ) {
      if (inputValue.new_password !== inputValue.confirm_new_password) {
        Swal.fire({
          title: "New passwords do not match!",
          confirmButtonColor: "#56b124",
        });
        return;
      }
      try {
        const apiKey = localStorage.getItem("KTMauth");

        const accessToken = await getAccessTokenFromRefresh();
        const data = new FormData();
        data.append("email" , apiKey['email'])
        data.append("user_type" , apiKey['account_type'])
        data.append("old_password", inputValue.old_password);
        data.append("new_password", inputValue.new_password);
        data.append("confirm_password" , inputValue.confirm_new_password);

        await axios.post(USER_API_ENDPOINTS.CHANGE_PASSWORD, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire({
          title: "Password changed successfully!",
          confirmButtonColor: "#56b124",
        }).then(() => {
          history.push("/sell/user/profile");
        });
        setInputValue({
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
      } catch (err) {
        Swal.fire({
          title: "Failed to change password!",
          confirmButtonColor: "#56b124",
        });
      }
    }
  };

  return (
    <div >
        <Navbar/>
        <div className="section !pt-0  !flex !flex-row !w-full">
      <div className="flex flex-col items-center justify-center ">
        <h1 className="font-bold text-4xl">Change Password</h1>
      <form className="form  !py-5" onSubmit={handleChangePassword}>
        <p className="form__top__text">
          Enter your old password and set a new password for your account.
        </p>
        <TextField
          className="input"
          type="password"
          label="Old Password"
          variant="outlined"
          name="old_password"
          required
          onChange={getInputValue}
          value={inputValue.old_password}
        />
        <TextField
          className="input"
          type="password"
          label="New Password"
          variant="outlined"
          name="new_password"
          required
          onChange={getInputValue}
          value={inputValue.new_password}
        />
        <TextField
          className="input"
          type="password"
          label="Confirm New Password"
          variant="outlined"
          name="confirm_new_password"
          required
          onChange={getInputValue}
          value={inputValue.confirm_new_password}
        />
        <button className="form__button" type="submit">
          Change Password
        </button>
      </form>
      </div>

      <RightBanner/>
    </div>
    </div>
  );
};

export default ChangePassword;
