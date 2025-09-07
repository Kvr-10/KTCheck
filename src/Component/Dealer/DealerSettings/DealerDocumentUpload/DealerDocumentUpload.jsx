import React, { useEffect, useState } from "react";
// import axios from "axios";

// css
import "../../../../Css/DealerDocumentUpload.css";
import "../../../../App.css";

// component
import DealerProfileSearchbar from "../../DealerProfileSearchbar";
import DealerProfileNavbar from "../../DealerProfileNavbar";
import KabadiDocumentUpload from "./KabadiDocumentUpload";
import CollectorDocumentUpload from "./CollectorDocumentUpload";
import RecyclerDocumentUpload from "./RecyclerDocumentUpload";
import MainFooter from "../../../Footer/MainFooter";
import TermFooter from "../../../Footer/TermFooter";
import Navbar from "../../../Navbar";
// api url
// import { apiUrl } from "../../../../Private";

const DealerDocumentUpload = () => {
  // const [dealerData, setDealerData] = useState();

  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  console.log(apiKey)
  const roleDisplay = apiKey && apiKey.account_role ? apiKey.account_role.charAt(0).toUpperCase() + apiKey.account_role.slice(1) : "";
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get dealer data
  useEffect(() => {
    const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
    console.log(apiKey);
  }, []);

  return (
    <>
      <Navbar />
      <DealerProfileSearchbar />

      <DealerProfileNavbar />

      <div className="dealer__document__upload__section similar__section">
        <h1 className="similar__section__headinng">Upload Your Documents</h1>
        {roleDisplay && (
          <p style={{ marginTop: 2, marginBottom: 6, color: '#555' }}>
            Role: <span style={{ fontWeight: 700, color: '#56b124' }}>{roleDisplay}</span>
          </p>
        )}
        {/* {(() => {
          if (dealerData !== undefined) {
            if (dealerData.type === "kabadiwala") {
              return <KabadiDocumentUpload />;
            } else if (dealerData.type === "collector") {

              return <CollectorDocumentUpload />;
            } else if (dealerData.type === "recycler") {
              return <RecyclerDocumentUpload />;
            }
          }
        })()} */}
        {(() => {
  if (!apiKey || !apiKey.account_role) return null;

  const role = apiKey.account_role.toLowerCase();

  if (role === "kabadiwala") return <KabadiDocumentUpload />;
  if (role === "collector") return <CollectorDocumentUpload />;
  if (role === "recycler") return <RecyclerDocumentUpload />;

  return null;
})()}

      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default DealerDocumentUpload;
