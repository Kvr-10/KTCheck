import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { apiUrl } from "../../Private";

// css
import "../../Css/DealerContactCard.css";
import Swal from "sweetalert2";
// material ui
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { USER_API_ENDPOINTS } from "../../utils/apis";

const DealerContactCard = (props) => {
  // Get customer data from localStorage
  const customerData = JSON.parse(localStorage.getItem("KTMauth"));

  const [isOpen, setIsOpen] = useState(false);
  const [sellInput, setSellInput] = useState({
    dealer_id: "",
    customer_name: customerData?.full_name || "",
    phone: customerData?.phone_number || "",
    email: customerData?.email || "",
    itemName: "",
    itemPic: null,
    previewUrl: null,
    quantity: "",
    description: "",
  });

  const getSellInput = (e) => {
    setSellInput({
      ...sellInput,
      [e.target.name]: e.target.value,
    });
  };

  const uploadPic = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSellInput({
        ...sellInput,
        itemPic: file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const openModal = () => {
    setIsOpen(!isOpen);
  };

  const submitSellItem = async () => {
    if (
      typeof sellInput.customer_name === "string" &&
      !isNaN(sellInput.phone) &&
      sellInput.phone.length === 10 &&
      sellInput.quantity > 0
    ) {
      const data = new FormData();
      data.append("dealer_id", props.dealerId);
      data.append("customer_name", sellInput.customer_name);
      data.append("phone", sellInput.phone);
      data.append("email", sellInput.email);
      data.append("itemName", sellInput.itemName);
      if (sellInput.itemPic instanceof File) {
        data.append("itemPic", sellInput.itemPic);
      }
      data.append("quantity", sellInput.quantity);
      data.append("description", sellInput.description);

      try {
        await axios.post(USER_API_ENDPOINTS.REQUEST_ENQUIRY_DEALER, data);
        setIsOpen(false);
        
        // Reset form but keep customer details
        setSellInput({
          dealer_id: "",
          customer_name: customerData?.full_name || "",
          phone: customerData?.phone_number || "",
          email: customerData?.email || "",
          itemName: "",
          itemPic: null,
          previewUrl: null,
          quantity: "",
          description: "",
        });

        Swal.fire({
          title: "Request placed successfully",
          confirmButtonColor: "#56b124"
        });
      } catch (err) {
        Swal.fire({
          title: "Request can't be placed",
          text: err?.response?.data?.itemPic?.[0] || "Something went wrong",
          confirmButtonColor: "#56b124"
        });
      }
    } else {
      Swal.fire({
        title: "Fill the form properly",
        confirmButtonColor: "#56b124"
      });
    }
  };

  return (
    <>
      <div className="dealer__contact__card">
        <h2>KTD{props.dealerId} is Available</h2>
        <p>
          Dealing in:{" "}
          {Array.isArray(props.Dealing)
            ? props.Dealing.map((item, index) => (
                <span key={index}>{item}{index !== props.Dealing.length - 1 ? ', ' : ''}</span>
              ))
            : <span>{props.Dealing}</span>
          }
        </p>
        <p>Minimum Qty: <span>{props.Minimum}kg</span></p>
        <p>Maximum Qty: <span>{props.Maximum}kg</span></p>
        <p>Timing: <span>8am to 7pm</span></p>
        <button onClick={() => setIsOpen(true)}>Sell</button>
      </div>

      <Modal
        isOpen={isOpen}
        ariaHideApp={false}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            border: 'none',
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            maxHeight: '85vh',
            width: '95%',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            margin: 0,
            transform: 'none',
            inset: 'auto'
          }
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: '#f8f9fa',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#666',
            transition: 'all 0.2s',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = '#666';
          }}
        >
          ×
        </button>
        
        <div style={{ 
          marginBottom: '25px',
          padding: '0 10px'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(18px, 4vw, 24px)', 
            fontWeight: '600', 
            color: '#333', 
            marginBottom: '8px',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            Sell Your Item
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.4',
            maxWidth: '300px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Fill the form below to connect with the dealer
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <input
            type="file"
            required
            accept="image/*"
            name="itemPic"
            id="itemPic"
            onChange={uploadPic}
            onClick={(e) => e.target.value = null}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="itemPic"
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              backgroundColor: '#56b124',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              width: '100%',
              maxWidth: '300px',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            📷 Select Item Picture
          </label>
        </div>

        {sellInput.previewUrl && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <img 
              src={sellInput.previewUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: "200px", 
                maxHeight: "150px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "2px solid #e9ecef"
              }} 
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
              Image Preview
            </p>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '15px'
        }}>
          <input
            type="text"
            value={sellInput.customer_name}
            name="customer_name"
            placeholder="Customer Name"
            onChange={getSellInput}
            disabled={!!customerData?.full_name} // Disable if customer data exists
            style={{
              padding: '12px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              transition: 'border-color 0.2s',
              outline: 'none',
              backgroundColor: customerData?.full_name ? '#f8f9fa' : 'white',
              color: customerData?.full_name ? '#666' : '#333',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            value={sellInput.phone}
            name="phone"
            placeholder="Phone Number"
            onChange={getSellInput}
            disabled={!!customerData?.phone_number} // Disable if customer data exists
            style={{
              padding: '12px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              transition: 'border-color 0.2s',
              outline: 'none',
              backgroundColor: customerData?.phone_number ? '#f8f9fa' : 'white',
              color: customerData?.phone_number ? '#666' : '#333',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '15px'
        }}>
          <input
            type="email"
            value={sellInput.email}
            name="email"
            placeholder="Email Address"
            onChange={getSellInput}
            disabled={!!customerData?.email} // Disable if customer data exists
            style={{
              padding: '12px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              transition: 'border-color 0.2s',
              outline: 'none',
              backgroundColor: customerData?.email ? '#f8f9fa' : 'white',
              color: customerData?.email ? '#666' : '#333',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            value={sellInput.itemName}
            name="itemName"
            placeholder="Item Name"
            onChange={getSellInput}
            style={{
              padding: '12px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              transition: 'border-color 0.2s',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <input
          type="number"
          value={sellInput.quantity}
          name="quantity"
          placeholder="Quantity (in kg)"
          onChange={getSellInput}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            transition: 'border-color 0.2s',
            outline: 'none',
            marginBottom: '15px',
            boxSizing: 'border-box'
          }}
        />

        <textarea
          value={sellInput.description}
          name="description"
          placeholder="Description (optional)"
          onChange={getSellInput}
          rows="3"
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            transition: 'border-color 0.2s',
            outline: 'none',
            marginBottom: '25px',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit',
            minHeight: '80px'
          }}
        />

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={submitSellItem}
            style={{
              backgroundColor: '#56b124',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 40px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              boxShadow: '0 2px 4px rgba(86, 177, 36, 0.2)',
              width: '100%',
              maxWidth: '300px',
              minHeight: '50px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#4a9e1f';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#56b124';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Submit Request
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DealerContactCard;
