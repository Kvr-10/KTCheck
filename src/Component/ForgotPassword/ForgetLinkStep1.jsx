import axios from 'axios';
import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
// import logo from '../../Image/kabadi__techno__logo.png';
import logo from "../../Image/logo.png";
// import classes from '../../Css/ForgetLinkStep1.module.css';
// import  '../../Css/ForgetLinkStep1.module.css';
import '../../Css/ForgetLinkStep1.css';
import { USER_API_ENDPOINTS } from '../../utils/apis';

const ForgetLinkStep1 = (props) => {

  // const { utype, uid, token } = useParams();

  // const uid = props.match.params.id;
  // const token = props.match.params.token;

  const history = useHistory();

  const [showPswd, setShowPswd] = useState(false);
  const [showNewPswd, setShowNewPswd] = useState(false);
  const [password, setPassword] = useState();
  const changePswdState = () => {
    setShowPswd(!showPswd);
  }
  const changeNewPswdState = () => {
    setShowNewPswd(!showNewPswd);
  }

  const [inputValue, setInputValue] = useState({
    newPassword: "",
    confirmNewPassword: ""
  });
  const {code , resetId} = useParams();
  console.log(code + "/" + resetId);

  const confirmationstep = async (e) => {

    e.preventDefault();
    
    try {
      // const url = `${resetPasswordUrl}/${code}/${resetId}`;

      // const data = new FormData();

      // data.append("token", props.token);
      // data.append("user_id", props.id);
      // if (inputValue.newPassword === inputValue.confirmNewPassword && inputValue.newPassword.length >= 8) {
      //   data.append("password", inputValue.newPassword);

      
      
      // data.append("confirm_newpassword", inputValue.confirmNewPassword);


      // const response2 = await axios.patch(url, data,
      //   headers= {
      //     "Content-Type":"multipart/form-data"
      //   }
      // );

      // Aryan Code
      if (inputValue.newPassword === inputValue.confirmNewPassword && inputValue.newPassword.length >= 8) {
      const response = await axios.post(
        USER_API_ENDPOINTS.RESET_PASSWORD + `/${code}/${resetId}/`,
        {
          new_password: inputValue.newPassword
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log(response);
      history.push('/password_change_success');

      console.log(response);
      history.push('/password_change_success');
      }
      else {
        Swal.fire({
          title: "Password should be greater than 8 characters",
          confirmButtonColor: "#56b124"
        })
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "Reset Link is invalid",
        confirmButtonColor: "#56b124"
      })
    }

  }

  // console.log(uid);
  // console.log(token);

  const getInputValue = (e) => {
    setInputValue({
      ...inputValue,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page_forget">
      <div className="back">
        <div className="form">
          <form className="sign_in_pswd" onSubmit={confirmationstep}>
            <h1 className="sign_in_pswd_h1">Change Password</h1>
            <div className="sign_in_pswd_div">
              <p className="sign_in_pswd_p">Enter the changed password.</p>
              <div className="form_div">


                <input aria-invalid="false" required
                  type={showPswd ? "text" : "password"}
                  className="design_input" placeholder="New Password" name="newPassword" id="new_password1" onChange={getInputValue} value={inputValue.newPassword}/>
                <label className="input_text"></label>


                <div className="form_eye_button" onClick={changePswdState}>
                  <span className="label_eye_button">
                    {!showPswd && <svg className="eye_button" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path></svg>}
                    {showPswd && <svg className="eye_button" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>}
                  </span>
                </div>
              </div>
              <div className="form_div">


                <input aria-invalid="false" required
                  type={showNewPswd ? "text" : "password"}
                  className="design_input" placeholder="Confirm Password" name="confirmNewPassword" id="new_password2" onChange={getInputValue} value={inputValue.confirmNewPassword}/>
                <label className="input_text"></label>


                <div className="form_eye_button" onClick={changeNewPswdState}>
                  <span className="label_eye_button">
                    {!showNewPswd && <svg className="eye_button" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path></svg>}
                    {showNewPswd && <svg className="eye_button" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>}
                  </span>
                </div>
              </div>
            </div>
            <button className="sign_in_btn">Submit</button>
          </form>
        </div>
        <div className="content">
          <center>
            <img src={logo} alt="logo" border="0" height="130px" />
            <h2>KABADI TECHNO</h2>
            <p>"Don't waste your waste."</p>
          </center>
        </div>
      </div>
    </div>


    // <div className={classes.forget}>
    //   <form id="form" onSubmit={confirmationstep} className={classes.forget__form}>
    //     <img src={logo} alt="" />
    //     <h1>Password Reset</h1>
    //     <input type="password" placeholder="New Password" name="newPassword" id="new_password1" required onChange={getInputValue} value={inputValue.newPassword} />
    //     <input type="password" placeholder="Confirm Password" name="confirmNewPassword" id="new_password2" required onChange={getInputValue} value={inputValue.confirmNewPassword} />

    //     {/* <input name="uid" hidden value={{ uid }} /> */}
    //     {/* <input name="token" hidden value={{ token }} /> */}

    //     <button type="submit">Reset</button>
    //   </form>
    // </div>
  )
}

export default ForgetLinkStep1