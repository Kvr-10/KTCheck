import React, { useEffect , useState } from "react";
import axios from "axios";

// css
import "../../../../Css/DealerAreaCard.css";

const DealerAreaCard = (props) => {

  const [areaInputData,setAreaInputData] = useState({
    state: "",
    city: "",
    area: ""
  })

  // get pincode state and city
  useEffect(() => {
    axios.get(`https://api.postalpincode.in/pincode/${props.pincode}`)
        .then((response) => {
          setAreaInputData({
            ...areaInputData,
            state: response.data[0].PostOffice[0].State,
            city: response.data[0].PostOffice[0].District,
            area: response.data[0].PostOffice[0].Block,
          });
        }).catch((err) => {
          console.log(err)
        })
  },[])
  return (
    <div className="dealer__area__card">
      <h1>{props.pincode}</h1>
      <p>
        State : <span>{areaInputData.state}</span>
      </p>
      <p>
        City : <span>{areaInputData.city}</span>
      </p>
      <p>
        Area : <span>{areaInputData.area}</span>
      </p>
      <button onClick={props.deleteArea}>Delete Area</button>
    </div>
  );
};

export default DealerAreaCard;
