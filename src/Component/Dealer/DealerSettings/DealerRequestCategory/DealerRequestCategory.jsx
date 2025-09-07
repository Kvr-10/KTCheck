import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import DealerRequestCategoryCard from "./DealerRequestCategoryCard";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";
import Navbar from "../../../Navbar";
// css
import "../../../../Css/DealerRequestCategory.css";
import "../../../../App.css";

// image
import upload__document from "../../../../Image/upload__document.png";
import tick__image from '../../../../Image/tick__image.png'

// dealer request category data
import { DealerRequestCategoryData } from "./DealerRequestCategoryData";
import { apiUrl } from "../../../../Private";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const DealerRequestCategory = () => {
  const [inputValue, setInputValue] = useState({
    img: "",
    img__status: upload__document,
    title: "",
    description: "",
  });
  // const image_url = `${apiUrl}${inputValue.img}`
  const [dealerRequestCategoryData, setDealerRequestCategoryData] = useState(DealerRequestCategoryData);

  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get image
  const getImage = (e) => {
    let attribute = e.target.name + "__status";
    if (e.target && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setInputValue({
            ...inputValue,
            [e.target.name]: file,
            [attribute]: reader.result,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  //get requested category data 
  useEffect(() => {
    axios.get(USER_API_ENDPOINTS.GET_CATEGORY_REQUESTS_DEALER_DETAILS+ `${apiKey.dealer_id}/`)
      .then((res) => {
        setDealerRequestCategoryData(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // get input value
  const getInputValue = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  // request category
  const requestCategory = async (e) => {
    e.preventDefault();
    if (inputValue.img !== "") {
      const data = new FormData();
      data.append("dealer_id", apiKey["dealer_id"]);
      data.append("category_image", inputValue.img);
      data.append("description", inputValue.description);
      data.append("category_name", inputValue.title);

      console.log(data)

      // setInputValue({ image: upload__document, name: "", description: "" });
      try {
        const res = await axios.post(USER_API_ENDPOINTS.ADD_CATEGORY_REQUESTS_DEALER_DETAILS, data, {
          headers: {
            "Content-type": "multipart/form-data",
          }
        })
        console.log(res.data)
        Swal.fire({
          title: "Successfully requested",
          confirmButtonColor: "#56b124",
        });
        history.push("/dealer/settings");
      }
      catch (err) {
        console.log(err)
      }
    }
  };

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__request__category similar__section">
        <h1 className="similar__section__heading">Request to Add Category</h1>

        <form className="request__category__form" onSubmit={requestCategory}>
          <img src={inputValue.img__status} alt="" />
          <input
            type="file"
            required
            accept="image/*"
            style={{ display: "none" }}
            id="img"
            name="img"
            onChange={getImage}
            onClick={(e) => {
              e.target.value = null;
            }}
          />
          <label htmlFor="img">Upload Image</label>
          <input
            type="text"
            placeholder="Category Name"
            required
            name="title"
            value={inputValue.title}
            onChange={getInputValue}
          />
          <input
            type="text"
            placeholder="Add Description"
            required
            name="description"
            value={inputValue.description}
            onChange={getInputValue}
          />
          <button type="submit">Request</button>
        </form>

        <div className="request__category">
          <h1>Requested Category</h1>
          <div>
            {dealerRequestCategoryData.length !== 0 ? (
              dealerRequestCategoryData.map((eachData, eachDataIndex) => {
                return (
                  <DealerRequestCategoryCard
                    key={eachDataIndex}
                    img={eachData.category_image}
                    name={eachData.category_name}
                    description={eachData.description}
                    status={eachData.status}
                  />
                );
              })
            ) : (
              <p>No request available here</p>
            )}
          </div>
        </div>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default DealerRequestCategory;
