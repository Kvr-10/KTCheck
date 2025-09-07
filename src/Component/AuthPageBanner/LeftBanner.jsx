import React from "react";
import { NavLink } from "react-router-dom";
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import Swal from "sweetalert2";

// css
import "../../App.css";
import "../../Css/Auth.css";

const LeftBanner = () => {
  const [text] = useTypewriter({
    words: ['"Be a part of solution,\nnot a part of pollution."'],
    loop: false,
    typeSpeed: 70,
    delaySpeed: 1000,
  });

  return (
    <div className="banner">
      <h1 className="typist">
        {text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </h1>
      <NavLink to="/signin/signup" className="banner__button">
        Sign Up
      </NavLink>
    </div>
  );
};

export default LeftBanner;
