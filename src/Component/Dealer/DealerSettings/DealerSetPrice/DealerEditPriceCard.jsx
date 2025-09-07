import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import { apiUrl } from "../../../../Private";

import DeleteIcon from '@mui/icons-material/Delete';

// css
import "../../../../Css/DealerPriceItemCard.css";
import { useHistory } from "react-router-dom";
import { USER_API_ENDPOINTS } from "../../../../utils/apis";

const DealerEditPriceCard = (props) => {
  // set price

  console.log(props);

  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const history = useHistory();

  const [pricePincode, setPricePincode] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [samePriceForAll, setSamePriceForAll] = useState(false);

  const image_url =` ${apiUrl}/${props.img}`;

  const [inputValue, setInputValue] = useState([
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
    {
      pincode: "",
      subcategory: props.subcategory,
      dealer: apiKey['id'],
      price: "0"
    },
  ]);

  useEffect(() => {
    pincodes.map((eachPin,eachPinIndex) => {
      pricePincode.map((eachDetail,eachDetailIndex) => {
        if ((eachDetail['subcategory_name'] === props.name) && (eachDetail.pincode === eachPin)) {
          const tempData = [...inputValue]
          tempData[eachPinIndex]['price']  = eachDetail.price
          tempData[eachPinIndex]['pincode']  = eachDetail.pincode
        setInputValue(tempData)
      }
      })
    })
  },[pricePincode,pincodes])

  // get price and pincode
  useEffect(() => {
    axios.get(USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE+ `${apiKey.dealer_id}/`)
      .then((res) => {
        setPricePincode(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // get all pincodes of dealer
  useEffect(() => {
    axios.get(USER_API_ENDPOINTS.GET_DEALER_ALL_PINCODES+ `${apiKey.dealer_id}/`)
      .then((res) => {
        const pins = res.data;
        // Only keep valid 6-digit numeric pincodes
        const pinsfinal = Object.values(pins).filter(pin => typeof pin === 'string' && /^\d{6}$/.test(pin));
        setPincodes(pinsfinal);
        // Sync inputValue with pincodes
        setInputValue(pinsfinal.map(pin => ({
          pincode: pin,
          subcategory: props.subcategory,
          dealer: apiKey['id'],
          price: "0"
        })));
      })
      .catch((err) => {
        console.log(err)
      })
  }, [props.subcategory]);

  // Sync inputValue with fetched prices for each pincode/subcategory
  useEffect(() => {
    if (!pincodes.length) return;
    setInputValue(pincodes.map((pin) => {
      const detail = pricePincode.find(d => d.subcategory_name === props.name && d.pincode === pin);
      return {
        pincode: pin,
        subcategory: props.subcategory,
        dealer: apiKey['dealer_id'],
        price: detail ? detail.price : ""
      };
    }));
  }, [pricePincode, pincodes, props.name, props.subcategory]);

const getInputValue = (index, eachPin, e) => {
  const { name, value } = e.target;

  if (samePriceForAll && name === "price") {
    setInputValue(prevInputs => prevInputs.map(input => ({
      ...input,
      price: value
    })));
  } else {
    setInputValue(prevInputs => prevInputs.map((input, idx) =>
      idx === index
        ? { ...input, [name]: value, pincode: eachPin }
        : input
    ));
  }
};

const setPrice = async (e) => {
  e.preventDefault();

  // Check if any price is set to 0
  const hasZeroPrice = inputValue.some((element) => element.price === "0" || element.price === 0);
  if (hasZeroPrice) {
    Swal.fire({
      title: "Invalid Price",
      text: "Price cannot be 0. Please set a valid price.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
    return;
  }

  let anyError = false;
  let addedCount = 0;
  let updatedCount = 0;

  for (const element of inputValue) {
    if (!element.pincode || !element.subcategory || !element.dealer) continue;

    const data = new FormData();
    data.append("dealer", element.dealer);
    data.append("pincode", element.pincode);
    data.append("price", element.price);
    data.append("subcategory", element.subcategory);

    const existing = pricePincode.find(
      d => d.subcategory_name === props.name && d.pincode === element.pincode
    );

    try {
      if (existing) {
        await axios.post(USER_API_ENDPOINTS.UPDATE_PRICE_DEALER_DETAILS, data, {
          headers: { "Content-type": "multipart/form-data" },
        });
        updatedCount++;
      } else {
        await axios.post(USER_API_ENDPOINTS.ADD_PRICE_DEALER_DETAILS, data, {
          headers: { "Content-type": "multipart/form-data" },
        });
        addedCount++;
      }
    } catch (err) {
      console.error("Error for pincode", element.pincode, err);
      anyError = true;
    }
  }

  // Show a single final SweetAlert message
  if (anyError) {
    Swal.fire({
      title: "Price updated successful",
      text: `${addedCount} added, ${updatedCount} updated.`,
      icon: "success",
      confirmButtonColor: "#56b124",
    });
  } else {
    let msg = "";
    if (addedCount > 0) msg += `${addedCount} price${addedCount > 1 ? "s" : ""} added`;
    if (updatedCount > 0) {
      if (msg) msg += " and ";
      msg += `${updatedCount} price${updatedCount > 1 ? "s" : ""} updated`;
    }
    Swal.fire({
      title: "Price update successful",
      text: msg || "No changes made.",
      icon: "success",
      confirmButtonColor: "#56b124",
    });
  }

  // Refresh the price list after updates
  axios
    .get(USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE + `${apiKey.dealer_id}/`)
    .then((res) => setPricePincode(res.data));
};



  // delete the price
  const deletePrice = (index, pincode) => {
    const inputs = [...inputValue];
    const data = new FormData();
    data.append("dealer", apiKey['dealer_id']);
    data.append("subcategory", inputs[index]['subcategory']);
    data.append("pincode", pincode);
    axios.post(USER_API_ENDPOINTS.DELETE_PRICE_DEALER_DETAILS, data, {
      headers: { "Content-type": "multipart/form-data" }
    })
      .then(() => {
        console.log(data);
        Swal.fire({ title: "Successfully removed" });
        // Remove price from local state
        setInputValue(prevInputs => prevInputs.map((input, idx) =>
          idx === index ? { ...input, price: "" } : input
        ));
        // Optionally, refresh pricePincode after delete
        axios.get(USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE + `${apiKey.dealer_id}/`).then((res) => setPricePincode(res.data));
      })
      .catch((err) => {
        console.log(err);
        console.log(data);
        axios.get(USER_API_ENDPOINTS.GET_DEALER_DETAILS_PRICE + `${apiKey.dealer_id}/`).then((res) => setPricePincode(res.data));
        Swal.fire({ title: "Error removing price", confirmButtonColor: "green" });
      });
  }

  return (
    <form className="dealer__price__item__card" onSubmit={setPrice}>
      <div className="details__section">
        <div className="img">
          <img src={image_url} alt="" />
        </div>
        <div className="details">
          <h1>{props.name}</h1>
          <p className="details__heading">Set area price</p>
        </div>
      </div>
      <div className="price__section__section">
        <div className="price__list">
          <div className="same__price">
            <input
                type="checkbox"
                name="samePriceForAll"
                checked={samePriceForAll}
                onChange={(e) => {
                  setSamePriceForAll(e.target.checked);
                  // When toggled ON, sync all prices to the first price
                  if (e.target.checked && inputValue.length > 0) {
                    const priceToSet = inputValue[0].price || "";
                    setInputValue(prevInputs => prevInputs.map(input => ({
                      ...input,
                      price: priceToSet
                    })));
                  }
                }}
              />
            <p>Set same price for all area pincode</p>
          </div>
          {pincodes.map((eachPin, eachPinIndex) => {
            if(eachPin) // Only render for valid pincodes
            return (
              <div className="price__section" key={eachPinIndex}>
                <input value={eachPin} name="pincode" readOnly={true} />
                <p>:</p>
                <input
                  type="text"
                  placeholder="Set price"
                  onChange={(e) => { getInputValue(eachPinIndex, eachPin, e) }}
                  name="price"
                  value={inputValue[eachPinIndex]?.price || ""}
                />
                <DeleteIcon onClick={() => { deletePrice(eachPinIndex, eachPin) }} />
              </div>
            );
            return null;
          })}
        </div>
      </div>
      <div className="action__section">
        <div className="agree">
          <input type="checkbox" required />
          <p>Kabadi Techno Commission 1% Per/kg</p>
        </div>
        <button type="submit">Set Price</button>
      </div>
    </form>
  );
};

export default DealerEditPriceCard;
