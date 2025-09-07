import React from "react";

// css
import "../../Css/AboutWorkCard.css";

const AboutWorkCard = (props) => {
  return (
    <div className="about__work__card">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
    </div>
  );
};

export default AboutWorkCard;
