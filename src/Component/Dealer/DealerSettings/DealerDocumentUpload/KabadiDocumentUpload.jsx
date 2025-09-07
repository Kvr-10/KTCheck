import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// css
import "../../../../Css/DealerDocumentUpload.css";

// image
import upload__document from "../../../../Image/upload__document.png";
import pdf__image from "../../../../Image/pdf__image.png";
import tick__image from "../../../../Image/tick__image.png";
import { apiUrl } from "../../../../Private";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const KabadiDocumentUpload = () => {
  const [uploadedImage, setUploadedImage] = useState({
    adhaar: "",
    photo: "",
    other: "",
    adhaar__status: upload__document,
    photo__status: upload__document,
    other__status: upload__document,
  });
  const [documents, setDocuments] = useState([]);

  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

  // fetch uploaded documents
  useEffect(() => {
    if (apiKey && apiKey.id) {
      axios.get(`${USER_API_ENDPOINTS.DEALER_KABADI_FETCH_DOCUMENTS}${apiKey.dealer_id}/`)
        .then((res) => {
          if (res.data && typeof res.data === 'object') {
            setDocuments(res.data);
          } else {
            setDocuments({});
          }
        })
        .catch(() => setDocuments({}));
    }
  }, []);

  // upload image
  const uploadImage = (e, filetype) => {
    // const reader = new FileReader();
    // reader.readAsDataURL(e.target.files[0]);
    // reader.onload = () => {
    //   if (reader.readyState === 2) {
    //     setUploadedImage({ ...uploadedImage, [e.target.name]: reader.result });
    //   }
    // };
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
    if (uploadedImage.adhaar !== "" && uploadedImage.photo !== "") {
      const data = new FormData();
      data.append("dealer_id", apiKey["id"]);
      data.append("Aadhar_card", uploadedImage.adhaar)
      data.append("Pic", uploadedImage.photo)
      if (uploadedImage.other !== "")
        data.append("OtherDocuments", uploadedImage.other)

      try {
        const res = await axios.post(USER_API_ENDPOINTS.DEALER_KABADI_ADD_DOCUMENTS, data, {
          headers: {
            "Content-type": "multipart/form-data",
          }
        })
        setDocuments(res.data);
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
    <>
      {/* Render uploaded documents if present */}
      {documents && Object.keys(documents).some(key => documents[key]) && (
        <div className="document__upload uploaded__documents__section">
          {documents.Aadhar_card && (
            <div>
              <img
                src={documents.Aadhar_card.endsWith('.pdf') ? pdf__image : apiUrl + documents.Aadhar_card}
                alt="Aadhar Card"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.Aadhar_card, '_blank')}
              />
              <span>Aadhar Card</span>
            </div>
          )}
          {documents.Pic && (
            <div>
              <img
                src={documents.Pic.endsWith('.pdf') ? pdf__image : apiUrl + documents.Pic}
                alt="Photo"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.Pic, '_blank')}
              />
              <span>Photo</span>
            </div>
          )}
          {documents.OtherDocuments && (
            <div>
              <img
                src={documents.OtherDocuments.endsWith('.pdf') ? pdf__image : apiUrl + documents.OtherDocuments}
                alt="Other Document"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.OtherDocuments, '_blank')}
              />
              <span>Other Document</span>
            </div>
          )}
          {documents.GSTcertificate && (
            <div>
              <img
                src={documents.GSTcertificate.endsWith('.pdf') ? pdf__image : apiUrl + documents.GSTcertificate}
                alt="GST Certificate"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.GSTcertificate, '_blank')}
              />
              <span>GST Certificate</span>
            </div>
          )}
          {documents.CompanyPAN && (
            <div>
              <img
                src={documents.CompanyPAN.endsWith('.pdf') ? pdf__image : apiUrl + documents.CompanyPAN}
                alt="Company PAN"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.CompanyPAN, '_blank')}
              />
              <span>Company PAN</span>
            </div>
          )}
          {documents.CompanyIncopration && (
            <div>
              <img
                src={documents.CompanyIncopration.endsWith('.pdf') ? pdf__image : apiUrl + documents.CompanyIncopration}
                alt="Company Incorporation"
                className="uploaded__document__img"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                onClick={() => window.open(apiUrl + documents.CompanyIncopration, '_blank')}
              />
              <span>Company Incorporation</span>
            </div>
          )}
        </div>
      )}
      <form className="dealer__document__upload" onSubmit={submitDocument}>
        <div className="document__upload">
          <input
            type="file"
            accept='.pdf'
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
            accept='.pdf'
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
    </>
  );
};

export default KabadiDocumentUpload;
