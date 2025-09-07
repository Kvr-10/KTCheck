import React from "react";

// css
import "../Css/ChangePincode.css";

const ChangePincode = (props) => {
  return (
    <p className="change__pincode">
      Change your pincode <span onClick={props.openModal}>{props.pincode}</span>
    </p>
  );
};

export default ChangePincode;
