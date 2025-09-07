import React, { useEffect, useState } from "react";
import axios from "axios";

// component
import Navbar from "../Navbar";
import SellFaqTopBanner from "../SellFaqTopBanner";
import FaqCard from "./FaqCard";
import MainFooter from "../../Component/Footer/MainFooter";
import TermFooter from "../../Component/Footer/TermFooter";

// css
import "../../Css/Faq.css";

// api url
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const Faq = () => {
  const [faqData, setFaqData] = useState([]);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get faq data
  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.GET_FAQ_QUESTIONS)
      .then((response) => {
        setFaqData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="main__section">
        <SellFaqTopBanner title="Frequently asked Questions" />

        <div className="faq__section">
          {faqData.map((eachData, eachDataIndex) => {
            return (
              <FaqCard
                key={eachDataIndex}
                question={eachData.qns}
                answer={eachData.ans}
              />
            );
          })}
        </div>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default Faq;
