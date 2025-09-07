import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// css
import "../../../../Css/DealerDocumentUpload.css";

// image
import upload__document from "../../../../Image/upload__document.png";
import tick__image from "../../../../Image/tick__image.png";
import pdf__image from "../../../../Image/pdf__image.png";

//apiurl 
import { apiUrl } from "../../../../Private";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const RecyclerDocumentUpload = () => {
  const [uploadedImage, setUploadedImage] = useState({
    pan__status: upload__document,
    adhaar__status: upload__document,
    gst__status: upload__document,
    incorporation__status: upload__document,
    logo__status: upload__document,
    other__status: upload__document,
    pan: "",
    adhaar: "",
    gst: "",
    incorporation: "",
    logo: "",
    other: "",
  });

  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  // let total_doc_size = 0;

  // upload image
  const uploadImage = (e, filetype) => {

    // total_doc_size += e.target.files[0].size/1024;
    // console.log(total_doc_size)

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
  };

  // submit document
  const submitDocument = async (e) => {
    e.preventDefault();

    if (uploadedImage.adhaar !== "" && uploadedImage.logo !== "" && uploadedImage.gst !== "" && uploadedImage.pan !== "" && uploadedImage.incorporation !== "") {
      const data = new FormData();
      data.append("dealer_id", apiKey["id"]);
      data.append("CompanyPAN", uploadedImage.pan)
      data.append("Aadhar_card", uploadedImage.adhaar)
      data.append("GSTcertificate", uploadedImage.gst)
      data.append("CompanyIncopration", uploadedImage.incorporation)
      data.append("Pic", uploadedImage.logo)
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
          id="pan"
          name="pan"
          onChange={(e) => {
            uploadImage(e, "pdf")
          }}
          onClick={(e) => {
            e.target.value = null;
            setUploadedImage({ ...uploadedImage, pan: "", pan__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.pan__status} alt="" />
          <p>{uploadedImage.pan.name}</p>
          <label htmlFor="pan">Company PAN Card</label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          id="adhaar"
          name="adhaar"
          onChange={(e) => uploadImage(e, "pdf")}
          onClick={(e) => {
            e.target.value = null;
            setUploadedImage({ ...uploadedImage, adhaar: "", adhaar__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.adhaar__status} alt="" />
          <p>{uploadedImage.adhaar.name}</p>
          <label htmlFor="adhaar">Aadhaar Card</label>
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
            setUploadedImage({ ...uploadedImage, gst: "", gst__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.gst__status} alt="" />
          <p>{uploadedImage.gst.name}</p>
          <label htmlFor="gst">GST Certificate</label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          id="incorporation"
          name="incorporation"
          onChange={(e) => uploadImage(e, "pdf")}
          onClick={(e) => {
            e.target.value = null;
            setUploadedImage({ ...uploadedImage, incorporation: "", incorporation__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.incorporation__status} alt="" />
          <p>{uploadedImage.incorporation.name}</p>
          <label htmlFor="incorporation">
            Incorporation
            <br />
            certificate
          </label>
          <span>Required</span>
        </div>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="logo"
          name="logo"
          onChange={(e) => uploadImage(e, "image")}
          onClick={(e) => {
            e.target.value = null;
            setUploadedImage({ ...uploadedImage, logo: "", logo__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.logo__status} alt="" />
          <p>{uploadedImage.logo.name}</p>
          <label htmlFor="logo">Company Logo</label>
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
            setUploadedImage({ ...uploadedImage, other: "", other__status: upload__document })
          }}
        />
        <div>
          <img src={uploadedImage.other__status} alt="" />
          <p>{uploadedImage.other.name}</p>
          <label htmlFor="other">Other Documents</label>
        </div>
      </div>
      <button type="submit">Upload</button>
    </form>
  );
};

export default RecyclerDocumentUpload;
