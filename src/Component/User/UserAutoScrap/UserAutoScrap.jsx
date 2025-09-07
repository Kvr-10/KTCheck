import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import axios from "axios";

// css
import "../../../App.css";

// component
import Navbar from "../../Navbar";
import UserProfileSearchbar from "../../UserProfileSearchbar";
import UserProfileNavbar from "../UserProfileNavbar";
import UserAutoScrapCard from "./UserAutoScrapCard";
import MainFooter from "../../Footer/MainFooter";
import TermFooter from "../../Footer/TermFooter";

// api url
import { apiUrl } from "../../../Private";
import { USER_API_ENDPOINTS } from "../../../utils/apis";

const UserAutoScrap = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrapItemData, setScrapItemData] = useState([]);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get sell category data
  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.GET_CATEGORY)
      .then((res) => {
        // console.log(res.data[0]['name']);
        setScrapItemData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />

      <UserProfileSearchbar />

      <UserProfileNavbar />

      <div className="scrap__section">
        {scrapItemData.map((eachData) => {
          return (
            <UserAutoScrapCard
              key={eachData['id']}
              autoScrapService={() => {
                // setIsOpen(!isOpen);
                Swal.fire({
                  title: "This service is not available right now",
                  confirmButtonColor: "#56b124",
                });
              }}
              img={eachData['image']}
              title={eachData['name']}
            />
          );
        })}

        <Modal
          className="modal__content"
          overlayClassName="modal__overlay"
          isOpen={isOpen}
          ariaHideApp={false}
        >
          <h1>Fill area pincode & customer type</h1>
          <input type="text" placeholder="Pincode" />
          <input type="text" placeholder="customer type" disabled />
          <div>
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                Swal.fire({
                  title: "This service is not available right now",
                  confirmButtonColor: "#56b124",
                });
              }}
            >
              Done
            </button>
          </div>
        </Modal>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default UserAutoScrap;
