import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

// css
import "../../../../Css/DealerDocumentUpload.css";

// image
import upload__document from "../../../../Image/upload__document.png";
import pdf__image from "../../../../Image/pdf__image.png";
import tick__image from "../../../../Image/tick__image.png";
import { apiUrl } from "../../../../Private";
import axios from "axios";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";
const CollectorDocumentUpload = () => {
  const [uploadedImage, setUploadedImage] = useState({
    adhaar: "",
    photo: "",
    other: "",
    gst: "",
    adhaar__status: upload__document,
    photo__status: upload__document,
    other__status: upload__document,
    gst__status: upload__document,
  });

  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  // upload image
  const uploadImage = (e, filetype) => {

    let attribute = e.target.name + '__status';

    if (e.target && e.target.files[0]) {
      if (filetype === "image") {
        if (e.target.files[0].size <= 1024 * 200)
          setUploadedImage({ ...uploadedImage, [e.target.name]: e.target.files[0], [attribute]: tick__image })
        else {
          Swal.fire({
            title: "Please upload documents with logo size 200KB",
            confirmButtonColor: "#56b124",
          })
        }
      }
      if (filetype === "pdf") {
      if (e.target.files[0].size <= 1024 * 1024 * 2)
          setUploadedImage({ ...uploadedImage, [e.target.name]: e.target.files[0], [attribute]: pdf__image })
        else {
          Swal.fire({
            title: "Please upload documents with pdf size < 2 MB",
            confirmButtonColor: "#56b124",
          })
        }
      }
    }


    // if (e.target.files[0].size <= 1048576) {
    //   let attribute = e.target.name + '__status';
    //   if (e.target && e.target.files[0]) {
    //     if (filetype === "image")
    //       setUploadedImage({ ...uploadedImage, [e.target.name]: e.target.files[0], [attribute]: tick__image })
    //     else
    //       setUploadedImage({ ...uploadedImage, [e.target.name]: e.target.files[0], [attribute]: pdf__image })
    //   }
    // }
    // else {
    //   Swal.fire({
    //     title: "Please upload documents with size < 1MB",
    //     confirmButtonColor: "#56b124",
    //   })
    // }
  };

  // submit document
  const submitDocument = async (e) => {
    e.preventDefault();
    if (uploadedImage.adhaar !== "" && uploadedImage.photo !== "" && uploadedImage.gst !== "") {

      const data = new FormData();
      data.append("dealer_id", apiKey["id"]);
      data.append("Aadhar_card", uploadedImage.adhaar)
      data.append("Pic", uploadedImage.photo)
      data.append("GSTcertificate", uploadedImage.gst)
      if (uploadedImage.other !== "")
        data.append("OtherDocuments", uploadedImage.other)

      try {
        await axios.post(USER_API_ENDPOINTS.DEALER_KABADI_ADD_DOCUMENTS, data, {
          headers: {
            "Content-type": "multipart/form-data",
          }
        })
        Swal.fire({
          title: "Documents uploaded",
          confirmButtonColor: "#56b124",
        });
        history.push("/dealer/settings");
      }
      catch (err) {
        console.log(err)
        Swal.fire({
          title: "Please upload documents in valid formats",
          confirmButtonColor: "#56b124",
        });
      }
    }
    else {
      Swal.fire({
        title: "Please upload all the required documents",
        confirmButtonColor: "#56b124",
      })
    }
  };

  return (
    <form className="dealer__document__upload" onSubmit={submitDocument}>
      <div className="document__upload">
        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          id="adhaar"
          name="adhaar"
          onChange={(e) => uploadImage(e, "pdf")}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
        <div>
          <img src={uploadedImage.adhaar__status} alt="" />
          <label htmlFor="adhaar">Select Adhaar Card</label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="photo"
          name="photo"
          onChange={(e) => uploadImage(e, "image")}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
        <div>
          <img src={uploadedImage.photo__status} alt="" />
          <label htmlFor="photo">Select Your Photo</label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          id="gst"
          name="gst"
          onChange={(e) => uploadImage(e, "pdf")}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
        <div>
          <img src={uploadedImage.gst__status} alt="" />
          <label htmlFor="gst">GST Certificate</label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          id="other"
          name="other"
          onChange={(e) => uploadImage(e, "pdf")}
          onClick={(e) => {
            e.target.value = null;
          }}
        />
        <div>
          <img src={uploadedImage.other__status} alt="" />
          <label htmlFor="other">Other Documents</label>
        </div>
      </div>
      <button type="submit">Upload</button>
    </form>
  );
};

export default CollectorDocumentUpload;
