import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ReactTooltip from "react-tooltip";

// css
import "../Css/Navbar.css";

// material icon
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// logo
import kabadi__techno__logo from "../Image/navbar_logo.png";

// admin components
import AdminAccess from "./Admin/AdminAccess";

// utils
import { isAdmin } from "../utils/adminAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const rawAuth = localStorage.getItem("KTMauth");
  const apiKey = rawAuth ? JSON.parse(rawAuth) : null;

  // Check if admin button will be rendered
  const adminButtonVisible = isAdmin();

  // Determine redirect path
  let signInRedirect = "/signin";
  if (apiKey) {
    if (apiKey.account_type === "Dealer") {
      signInRedirect = "/dealer/home";
    } else if (apiKey.account_type === "Customer") {
      signInRedirect = "/sell/user/profile";
    }
  }

  return (
    <div className={`navbar ${adminButtonVisible ? 'admin-active' : ''}`}>
      <div>
        <NavLink exact to="/" className="logo">
          <img src={kabadi__techno__logo} alt="Kabadi Techno" />
        </NavLink>

        <ul className={isOpen ? "navlist navlist__active" : "navlist"}>
          <li>
            <NavLink
              exact
              to="/"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink
              exact
              to="/about"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              ABOUT
            </NavLink>
          </li>
          <li>
            <NavLink
              exact
              to="/joinus"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              JOIN&nbsp;US
            </NavLink>
          </li>
          <li>
            <NavLink
              exact
              to="/sell"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              SELL
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/faq"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
            >
              CONTACT
            </NavLink>
          </li>
          <li>
            <NavLink
              to={signInRedirect}
              className="navlink"
              activeClassName="active__navlink"
              onClick={() => setIsOpen(!isOpen)}
              data-effect={apiKey ? "solid" : null}
              data-tip={apiKey ? "You are Signed In" : null}
              data-background-color={apiKey ? "#44aa0e" : null}
              data-place={apiKey ? "bottom" : null}
              data-text-color={apiKey ? "#fff" : null}
            >
              {apiKey ? "DASHBOARD" : "SIGN IN"}
            </NavLink>
          </li>
          <li>
            <AdminAccess />
          </li>
          <ReactTooltip />
        </ul>

        <div className="menu" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
