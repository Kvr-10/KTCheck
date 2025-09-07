import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'

const Address = () => {

    const [address,setAddress] = useState([]);
    const [userProfile,setuserProfile] = useState();
    const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

    // useEffect(() => {
    //     axios.get(`${USER_API_ENDPOINTS.GET_CUSTOMER_PROFILE}/${apiKey['id']}/`)
    //     .then((res) => {
    //         setuserProfile(res.data);
    //           console.log("hiii ")
    //     }).catch((err) => {
    //         console.log(err)
    //     })
    // }
    // )

// useEffect(() => {
//     axios.get(`${USER_API_ENDPOINTS.GET_ADDRESS}/`, {
//         headers: {
//             'Authorization': `Bearer ${apiKey['accesstoken']}`
//         }
//     }).then((res) => {
//         setAddress(res.data)
//         console.log("hiii ")
//     }).catch((err)=> {
//         console.log(err);
//     })
// },[])


  return (
    <>
    <div>Address Page</div>
    <button>Add</button>
    <button>Delete</button>
    <button>Update</button>
    <button>Get</button>
    <h3>Your addresses are:</h3>
    <p>${address.pincode}</p>
    </>
  )
}

export default Address