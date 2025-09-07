  import React, { useEffect, useState } from "react";
  import { NavLink, useHistory } from "react-router-dom";
  import axios from "axios";
  import Swal from "sweetalert2";
  // import GoogleLogin from "react-google-login";

  // material ui component
  import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
  import Visibility from "@mui/icons-material/Visibility";
  import VisibilityOff from "@mui/icons-material/VisibilityOff";

  // component
  import Navbar from "../Navbar";
  import LeftBanner from "../AuthPageBanner/LeftBanner";
  import TermFooter from "../Footer/TermFooter";

  // css
  import "../../Css/Auth.css";

  // api url
  import { apiUrl, apiUrl1 } from "../../Private";
  import { USER_API_ENDPOINTS } from "../../utils/apis";


  // redux
  // import { useDispatch } from "react-redux";
  // import { stepReducerActions } from "../../Redux/stepReducer";

  const SignIn = () => {

    const [showPassword, setShowPassword] = useState(false);
    const history = useHistory();

    // show hide password
    const showHidePassword = () => {
      setShowPassword(!showPassword);
    };

    localStorage.setItem
    //::::::::::::::::::::::::::MINE:::::::::::::::::::::::
    const [inputEmail, setInputEmail] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [tabBtn, setTabBtn] = useState('customer');

    const login = async (e, usertype) => {
    e.preventDefault();
    const userType = usertype.charAt(0).toUpperCase() + usertype.slice(1).toLowerCase();

    if (!inputEmail || !inputPassword) {
      Swal.fire({
        title: "Both email and password are required",
        confirmButtonColor: "#56b124"
      });
      return;
    }

    const user = {
      email: inputEmail,
      password: inputPassword,
      user_type: userType
    };

    try {
      const res = await fetch(USER_API_ENDPOINTS.LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const response = await res.json();

      console.log(response);

      if (!res.ok) {
        if (res.status === 400) {
          Swal.fire({ title: "Email and password are required", confirmButtonColor: "#56b124" });
        } else if (data.message === "User doesn't exist") {
          Swal.fire({ title: 'User does not exist', confirmButtonColor: "#56b124" });
        } else if (res.status === 403) {
          Swal.fire({ title: "Account is not activated. Activation link sent.", confirmButtonColor: "#56b124" });
        } else if (data.error === "Invalid email or password.") {
          Swal.fire({ title: "Invalid Credentials", confirmButtonColor: "#56b124" });
        } else {
          Swal.fire({ title: `Not Valid For ${userType}`, confirmButtonColor: "#56b124" });
        }
        return;
      }
      

      const data = response?.user;

      console.log(data);
      

      
      localStorage.setItem("KTMgauth"  , JSON.stringify(response.token));

      localStorage.setItem("KTMauth" , JSON.stringify(response.user));
      
      

      console.log(data.account_type);


      if (data.account_type === "Customer") {
        history.push('/sell/user/profile');
      } else if (data.account_type === "Dealer") {
        history.push('/dealer/home');
      }
      // } else if (["Recycler", "Kabadi", "Collector"].includes(data.account_type)) {
      //   history.push('/dealer/home');
      // }

    } catch (err) {
      console.error("Login failed:", err);
      Swal.fire({ title: "Something went wrong. Please try again later.", confirmButtonColor: "#56b124" });
    }
  };

    //::::::::::::::::::::::::::MINE:::::::::::::::::::::::

    return (
      <>
        <Navbar />

        <div className="auth__section">
          <LeftBanner />

          <div className="section">
            <h1>Sign In</h1>

            <form className="form">
              <div className="signin__type__btns">
                <button
                  className={`signin__type ${'customer' === tabBtn ? 'active' : ''}`}
                  key={`customer Button`}
                  onClick={(e) =>{e.preventDefault(); setTabBtn('customer')}}
                >
                  Customer
                </button>
                <button
                  className={`signin__type ${'dealer' === tabBtn ? 'active' : ''}`}
                  key={`dealer Button`}
                  onClick={(e) =>{e.preventDefault();setTabBtn('dealer')}}
                >
                  Dealer
                </button>
              </div>
              <TextField
                className="input"
                type="email"
                label="Email ID"
                variant="outlined"
                onChange={(e) => setInputEmail(e.target.value)}
                name="email"
                value={inputEmail}
                required
              />
                <FormControl variant="outlined" className="form__control">
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    required
                    label="Password"
                    className="input"
                    type={showPassword ? "text" : "password"}
                    value={inputPassword}
                    name="password"
                    onChange={(e) => setInputPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={showHidePassword} edge="end">
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>

              <NavLink
                className="forgot__password__link"
                to="/forget_password"
              >
                Forgot Password?
              </NavLink>
              {/* <div className="form__btns"> */}
              {/* <button className="form__button" type="submit" value="customer" name="customer" onClick={(e) => { login(e,"customer"); }}>
                Sign In Customer
              </button>
              <button className="form__button" type="submit" value="dealer" name="dealer"  onClick={(e) => { login(e,"dealer"); }}>
                Sign In Dealer
              </button> */}
              <button className="form__button" type="submit" onClick={(e) => { login(e, tabBtn); }}>
                Sign In
              </button>
              {/* </div> */}
            </form>
            {/* <p>Or connect with</p>

            <div className="auth">
              <GoogleLogin
                clientId="839555905156-qpenbug205f1mu5sftdu8skmhmh5pgn9.apps.googleusercontent.com"
                render={(renderProps) => (
                  <button
                    className="auth__button"
                    onClick={() => {
                      renderProps.onClick();
                    }}
                    disabled={renderProps.disabled}
                  >
                    <img
                      src="https://image.flaticon.com/icons/png/128/281/281764.png"
                      alt="google-icon"
                    />
                  </button>
                )}
                buttonText="Login"
                onSuccess={(response) => responseGoogle(response)}
                onFailure={(response) => responseGoogle(response)}
                cookiePolicy={"single_host_origin"}
              />
            </div> */}
          </div>
        </div>

        <TermFooter />
      </>
    );
  };

  export default SignIn;





































  // import { Fragment, useState } from 'react';
  // import { Link } from 'react-router-dom';
  // import classes from './SignIn.module.css';

  // import { apiUrl } from '../../Private';

  // const SignIn = () => {

  //     const [inputEmail, setInputEmail] = useState("");
  //     const [inputPassword, setInputPassword] = useState("");

  //     async function login(e) {

  //         e.preventDefault();

  //         console.log(inputEmail);
  //         console.log(inputPassword);

  //         try {

  //             let user = {
  //                 "email": inputEmail,
  //                 "password": inputPassword
  //             };

  //         let result = await fetch(`${apiUrl}/user_login`, {
  //             method:'POST',
  //             headers:{
  //                 "Content-Type":"application/json",
  //                 "Accept":'application/json'
  //             },
  //             body:JSON.stringify(user)
  //         });

  //         result = await result.json();
  //         localStorage.setItem("KTMauth", JSON.stringify(result));
  //         console.log("success");

  //     }catch(err) {
  //         console.log(err);
  //     };
  //     }

  //     const cls = `line-1 anim-typewriter`;
  //     return (
  //         <Fragment>
  //             <div id={classes.maincontent}>
  //                 <section id={classes.home}>
  //                     <hgroup className={cls}>"Be a part of solution, <br />not a part of pollution."</hgroup>
  //                     <button className={classes.btn} id={classes.signup}><Link to="/signin/signup">Sign Up</Link></button>
  //                 </section>
  //                 <div className={classes.sidebar}>
  //                     <h1>Sign-In</h1>
  //                     <div className={classes.form}>
  //                         {/* <label for="email_id"></label> */}
  //                         <input type="email" name="email_id" id={classes.email_id} placeholder="Email ID*" onChange={(e) => setInputEmail(e.target.value)} />
  //                         <br />
  //                         {/* <label for="password"></label> */}
  //                         <input type="password" name="password" id={classes.password} placeholder="Password" onChange={(e) => setInputPassword(e.target.value)} />
  //                         <br />
  //                         <Link to="/signin/forgotpassword">Forgot Password?</Link>
  //                         <br />
  //                         <button className={classes.btn} id={classes.signin} type="submit" onClick={login}>Sign In</button>
  //                     </div>
  //                 </div>
  //             </div>
  //         </Fragment>
  //     );
  // }

  // export default SignIn;