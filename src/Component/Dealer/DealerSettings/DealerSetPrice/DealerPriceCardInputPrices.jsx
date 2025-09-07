// By sneha,chaman, i think its of no use!!! (Static file)

import React, { useEffect , useState } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { apiUrl } from "../../../../Private";

// css
import "../../../../Css/DealerPriceItemCard.css";
import '../../../../Css/DealerPriceCardInputPrices.css'

import DeleteIcon from '@mui/icons-material/Delete';
import { USER_API_ENDPOINTS } from '../../../../utils/apis';

const DealerPriceCardInputPrices = (props) => {

  const [isTouched,setIsTouched] = useState(false)

    const apiKey = JSON.parse(localStorage.getItem("KTMauth"));

    useEffect(() => {
      console.log('state changed')
    },[isTouched])

    const setPrice = async (e) => {
      e.preventDefault();
  
      const data = new FormData();
      data.append("subcategory", props.subcategory);
      data.append("dealer", apiKey['dealer_id']);
      data.append("pincode", "787555");
      data.append("price", 14);
  
      // setInputValue({ image: upload__document, name: "", description: "" });
      try {
        const res = await axios.post(USER_API_ENDPOINTS.ADD_PRICE_DEALER_DETAILS, data, {
          headers: {
            "Content-type": "multipart/form-data",
          }
        })
        Swal.fire({
          title: "Successfully Edited",
          confirmButtonColor: "#56b124",
        });
      }
      catch (err) {
        console.log(err)
      }
  
      Swal.fire({
        title: "The price has been set successfully",
        confirmButtonColor: "#56b124",
      });
    };

    const deletePrice = () => {
        const data = new FormData();
        data.append("subcategory",props.subcatid);
        data.append("dealer",apiKey['id']);
        data.append("pincode",props.pincode);
        axios.post(USER_API_ENDPOINTS.DELETE_PRICE_DEALER_DETAILS ,data , {
          headers:{
            "Content-type":"multipart/form-data",
          }
        })
        .then((res) => {
          Swal.fire({
            title:"successfully removed",
          })
        })
        .catch((err) => {
          console.log(err)
          Swal.fire({
            title:"successfully removed",
            confirmButtonColor: "green",
          })
        })
      }

  return (
    <div className="price__section">
        <h1>{props.pincode}</h1>
                {/* <input
                  type="number"
                  placeholder={eachDetail.pincode}
                  // name={eachDetailIndex}
                /> */}
                <p>:</p>
                <input
                  type="text"
                  placeholder={props.price}
                //   value={inputValue.price}
                //   onChange={getInputValue}
                  // name={eachDetailIndex}
                />
                <DeleteIcon onClick={deletePrice} />
    </div>
  )
}

export default DealerPriceCardInputPrices