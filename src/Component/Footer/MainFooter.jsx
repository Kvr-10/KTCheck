import React from "react";
import { NavLink } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';

// css
import "../../Css/Footer.css";

// material icon
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const MainFooter = () => {
  return (
    //   main footer
    <div className="main__footer">
      {/* link section */}
      <div className="link__section">
        {/* about us links */}
        <ul>
          <h1 className="footer__header">ABOUT US</h1>
          <li>
            <HashLink className="footer__link" to="/#ourvision">Our Vision</HashLink>
            {/* <a className="footer__link" href="/#ourvision">
              Our Vision
            </a> */}
          </li>
          <li>
            <HashLink className="footer__link" to="/#ourmission">Our Mission</HashLink>
          </li>
          <li>
          <HashLink className="footer__link" to="/#ourteam">Our Team</HashLink>
          </li>
          <li>
            <HashLink className="footer__link" to="/#whatwedo">What We do?</HashLink>
          </li>
        </ul>

        {/* important links */}
        <ul>
          <h1 className="footer__header">IMPORTANT LINKS</h1>
          <li>
          <HashLink className="footer__link" to="/sell/#sellyourscrap">Sell Your Scrap</HashLink>
          </li>
          <li>
          <HashLink className="footer__link" to="/joinus/#joinourteam">Join Our Team</HashLink>
          </li>
          <li>
            <NavLink exact to="/termsconditions" className="footer__link">
              Terms & Conditions
            </NavLink>
          </li>
          <li>
            <NavLink exact to="/privacypolicy" className="footer__link">
              Privacy Policy
            </NavLink>
          </li>
        </ul>

        {/* contact us links */}
        <ul>
          <h1 className="footer__header">CONTACT US</h1>
          <li>
            <p className="footer__link">
              <LocationOnIcon className="footer__link__icon" /> 16, South Arjun
              Nagar Agra
            </p>
          </li>
          <li>
            <p className="footer__link">
              <EmailIcon className="footer__link__icon" /> Info@kabaditechno.com
            </p>
          </li>
          <li>
            <p className="footer__link">
              <PhoneIcon className="footer__link__icon" /> +91 7503386621
              <br />
              +91 9773857717
            </p>
          </li>
        </ul>
      </div>

      {/* social section */}
      <div className="social__section">
        <h1 className="footer__header">CONNECT WITH US</h1>
        <div className="social__link">
          <a href="https://www.facebook.com/kabaditechno/?modal=admin_todo_tour">
            <FacebookIcon className="social__link__icon" />
          </a>
          <a href="https://www.instagram.com/kabaditechno/">
            <InstagramIcon className="social__link__icon" />
          </a>
          <a href="https://www.linkedin.com/company/kabadi-techno">
            <LinkedInIcon className="social__link__icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainFooter;
