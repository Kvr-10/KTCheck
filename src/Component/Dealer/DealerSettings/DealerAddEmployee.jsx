import React, { useEffect, useState } from "react";
import Navbar from "../../Navbar";
import DealerProfileSearchbar from '../DealerProfileSearchbar';
import DealerProfileNavbar from '../DealerProfileNavbar';
import MainFooter from '../../Footer/MainFooter';
import TermFooter from '../../Footer/TermFooter';
import { USER_API_ENDPOINTS } from "../../../utils/apis";

import axios from "axios";
import Swal from "sweetalert2";

import '../../../Css/DealerAddEmployee.css'

const DealerAddEmployee = () => {

    const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

    const [inputValue, setInputValue] = useState({
        dealer_email: "",
        employee_email: "",
        username: "",
        password: "",
        profilePic: "",
        mobile_number: "",
        aadhar_card: "",
    });

    // scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const addEmployee = (e) => {
        e.preventDefault();

        if (
            typeof inputValue.username === "string" &&
            !isNaN(inputValue.mobile_number) &&
            inputValue.mobile_number.length === 10
        ) {
            if (inputValue.password.length >= 6) {
                const data = new FormData();
                data.append("dealer_email", apiKey["email"]);
                data.append("email", inputValue.employee_email);
                data.append("username", inputValue.username);
                data.append("password", inputValue.password);
                data.append("ProfilePic", inputValue.profilePic);
                data.append("mobile_number", inputValue.mobile_number);
                data.append("aadhar_card", inputValue.aadhar_card);

                axios
                    .post(`${USER_API_ENDPOINTS.EMPLOYEE_REGISTRATION}`, data, {
                        "Content-Type": "multipart/form-data",
                    })
                    .then((res) => {
                        Swal.fire({
                            title: "Employee added successfully",
                            confirmButtonColor: "#56b124",
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        Swal.fire({
                            title: err.response,
                            confirmButtonColor: "#56b124",
                        });
                    });
            } else {
                Swal.fire({
                    title: "Password should be minimum 6-digit",
                    confirmButtonColor: "#56b124",
                });
            }
        } else {
            Swal.fire({
                title: "Enter valid 10-digit mobile number",
                confirmButtonColor: "#56b124",
            });
        }
    }

    // getInput Value
    const getInputValue = (e) => {
        setInputValue({
            ...inputValue,
            [e.target.name]: e.target.value,
        })
    }

    // get file
    const getFile = (e) => {
        setInputValue({ ...inputValue, [e.target.name]: e.target.files[0] });
    };

    return (
        <>
            <Navbar />
            <DealerProfileSearchbar />

            <DealerProfileNavbar />

            <form className="add__employee__form" onSubmit={addEmployee}>
                <div className="input">
                    <div>
                        <label>Employee Email*</label>
                        <input type="text"
                            onChange={getInputValue}
                            value={inputValue.employee_email}
                            name="employee_email"
                            required
                        />
                    </div>
                    <div>
                        <label>Mobile Number*</label>
                        <input type="text"
                            onChange={getInputValue}
                            value={inputValue.mobile_number}
                            name="mobile_number"
                            required
                        />
                    </div>
                </div>
                <div className="input">
                    <div>
                        <label>Username*</label>
                        <input type="text"
                            onChange={getInputValue}
                            value={inputValue.username}
                            name="username"
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password"
                            onChange={getInputValue}
                            value={inputValue.password}
                            name="password"
                            required
                        />
                    </div>
                </div>
                <div className='input add__employee__files'>
                    <input
                        type="file"
                        accept='image/*'
                        style={{ display: "none" }}
                        id="profilePic"
                        name="profilePic"
                        onChange={getFile}
                        onClick={(e) => {
                            e.target.value = null;
                        }}
                    />
                    <div>
                        <label htmlFor="profilePic">Select Profile Pic</label>
                    </div>
                    <input
                        type="file"
                        accept='.pdf'
                        style={{ display: "none" }}
                        id="aadhar_card"
                        name="aadhar_card"
                        onChange={getFile}
                        onClick={(e) => {
                            e.target.value = null;
                        }}
                    />
                    <div>
                        <label htmlFor="aadhar_card">Select Adhaar Card</label>
                    </div>
                </div>
                <div className="input">
                    
                    <button type="submit" className="add__employee__btn">Submit</button>
                </div>
            </form>

            <MainFooter />

            <TermFooter />
        </>
    )
}

export default DealerAddEmployee