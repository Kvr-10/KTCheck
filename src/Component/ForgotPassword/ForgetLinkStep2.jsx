import React from 'react'

import logo from '../../Image/kabadi__techno__logo.png';
import classes from '../../Css/ForgetLinkStep2.module.css';

const ForgetLinkStep2 = () => {
  return (
    <>
      <div className="page_forget">
        <div className="back">
          <div className="form">
            <form className="sign_in_pswd">
              <h1 className="sign_in_pswd_h1">Password Changed</h1>
              <div className="sign_in_pswd_div">
                <p className="sign_in_pswd_p">Your password has been reset. You may go ahead and sign in now.</p>

              </div>
              <button className="sign_in_btn"><a href="/signin">Signin</a></button>
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

      {/* <div className={classes.forget__steptwo}>
    <img src={logo} alt="" />
      <h1>Your password has been reset. You may go ahead and sign in now.</h1>
      <a href="/signin">Sign In</a>
    </div> */}

    </>
  )
}

export default ForgetLinkStep2