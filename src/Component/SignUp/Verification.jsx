  import axios from 'axios'
  import React from 'react'
  import { useState } from 'react'
  import { useEffect } from 'react'
  import { NavLink, useParams } from 'react-router-dom'
  // import { useSearchParams } from "react-router-dom";
  import { useLocation } from "react-router-dom"

  import logo from '../../Image/navbar_logo.png';
  //css
  // import classes from '../../Css/ForgetLinkStep2.module.css';
  import '../../Css/ForgetLinkStep1.css';
import { USER_API_ENDPOINTS } from '../../utils/apis'

  const Verification = () => {

    const { utype } = useParams();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const[message , setMessage]= useState("");
    // const [searchParams] = useSearchParams();

    // const params1 = new URLSearchParams(window.location.pathname);

    // const location = useLocation();
    // const params3 = new URLSearchParams(location.search)

    // // const token1 = params1.get("token");
    // // const token2 = searchParams.userId
    // const token3 = params3.get("token");
    // console.log(token3)

    // Aryan code: 
    const {activationId , code} = useParams();
    console.log(code + "/" + activationId);
    useEffect(()=>{
      axios.get(USER_API_ENDPOINTS.ACTIVATE_API + `${code}/${activationId}/`)
      .then((res)=>{
        console.log(res);
        setMessage(res?.data?.message);
        setSuccess(true)
      })
      .catch((err)=>{
        console.log(err.message);
        setSuccess(err.message);
        setSuccess(false);
      })
      setLoading(false);
    })


  
    
    return (

      <div className="page_forget">
          <div className="back">
            <div className="form">
              <form className="sign_in_pswd">
                <h1 className="sign_in_pswd_h1">Email Verification Status</h1>
                <div className="sign_in_pswd_div">
                  {success && <p className="sign_in_pswd_p">Your email has been verified. You may go ahead and sign in now.</p> }
                  {!success && !loading && <p className="sign_in_pswd_p">Email activation Link expired</p> }
                  {!success && loading && <p className="sign_in_pswd_p">Loading..</p> }

                </div>
                <NavLink to='/signin' className='sign_in_btn'>Signin</NavLink>
                {/* <button className="sign_in_btn"><a href="/signin">Signin</a></button> */}
              </form>
            </div>
            <div className="content">
              <center>
                <img src={logo} alt="logo" border="0" height="130px" />
                <p>"Don't waste your waste."</p>
              </center>
            </div>
          </div>
        </div>

      // <div className="page_forget">
      //   <div className="back">
      //     <div className="content">
      //       <center>
      //         <img src={logo} alt="logo" border="0" height="130px" />
      //         { success && <h2>Email verified</h2> }
      //         { !success && <h2>Email activation link expired</h2> }
      //         <button className="sign_in_btn"><a href="/signin">Signin</a></button>
      //       </center>
      //     </div>
      //   </div>
      // </div>

      // Mine 

      // <div>
      //   <div className={classes.forget__steptwo}>
      //     <img src={logo} alt="" />
      //     {
      //     success && <h1>Email verified</h1>
      //     }
      //   {
      //   !success && <h1>Email activation link expired</h1>
      //   }
      //   <a href="/signin">Signin</a>
      //   </div>
      // </div>
    )
  }

  export default Verification