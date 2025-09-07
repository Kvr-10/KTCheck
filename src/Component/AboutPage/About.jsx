import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
// import { GoogleLogin } from "react-google-login";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";
import axios from "axios";
import Modal from "react-modal";
// import Swal from "sweetalert2";

// css
import "../../Css/About.css";
import "../../Css/TeamMemberCard.css";
import "../../App.css";

// component
import Navbar from "../Navbar";
import AboutWorkCard from "./AboutWorkCard";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";

// about work details
import { AboutWorkDetails } from "./AboutWorkDetails";

// image
// import startup__certificate from "../../Image/startup__certificate.svg";
import startup__certificate from "../../Image/certificate_new.svg";

// api url
import { apiUrl } from "../../Private";
import Swal from "sweetalert2";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const About = () => {
  const [aboutWorkDetails] = useState(AboutWorkDetails);
  const [teamMember, setTeamMember] = useState([]);
  const [banners, setBanners] = useState([]);
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [numVotes, setnumVotes] = useState(0);
  const [numYes, setnumYes] = useState(0);
  const [numNo, setnumNo] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // get team member data
  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.GET_TEAM_MEMBERS)
      .then((response) => {
        console.log("team member")
        setTeamMember(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // get public banners for top of about page
  useEffect(() => {
    let isMounted = true;
    axios
      .get(USER_API_ENDPOINTS.PUBLIC_BANNER_LIST)
      .then((response) => {
        if (isMounted && Array.isArray(response.data)) {
          setBanners(response.data);
          // Show popup if banners exist
          if (response.data.length > 0) {
            setShowBannerPopup(true);
          }
        }
      })
      .catch((err) => {
        console.log("Failed to fetch banners:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Banner popup auto-close and reappear timer
  useEffect(() => {
    let popupTimer;
    let reappearTimer;

    if (showBannerPopup && banners.length > 0) {
      // Auto-rotate banners every 3 seconds when popup is open
      popupTimer = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          prevIndex >= banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
    }

    return () => {
      if (popupTimer) clearInterval(popupTimer);
      if (reappearTimer) clearTimeout(reappearTimer);
    };
  }, [showBannerPopup, banners.length]);

  // Close banner popup
  const closeBannerPopup = () => {
    setShowBannerPopup(false);
    setCurrentBannerIndex(0);
    
    // Set timer to reappear after 1 minute
    setTimeout(() => {
      if (banners.length > 0) {
        setShowBannerPopup(true);
      }
    }, 60000); // 1 minute = 60000ms
  };

  // vote
  useEffect(() => {
    getVote();
  }, []);
// votes api by aryan
  async function getVote() {
    try {
      const response = await axios.get(USER_API_ENDPOINTS.GET_VOTES + "2/");
      const data = response.data;
      setnumVotes(Number(data["yes_count"] + Number(data["no_count"])));
      setnumNo(Number(data["no_count"]));
      setnumYes(Number(data["yes_count"]));
    } catch (error) {
      console.error(error);
    }
  }

  async function postVote(e,votes) {
    const ip = await axios.get(`https://api.ipify.org/?format=json`);
    const ipdata = ip.data;
    const votedata = {
      "vote": 2,
      "status": votes,
      "ip":ipdata.ip,
    }
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      const response  = await axios.post(
        USER_API_ENDPOINTS.ADD_VOTE,
        votedata,
        headers
      );
      
      if(response.data["Your Voting Choice was : "] !== undefined) {
        Swal.fire({
          title: `${response.data.unsuccessful}\n Your Voting Choice was : ${response.data["Your Voting Choice was : "]}`,
          confirmButtonColor: "#56b124",
        });
      } else {
        // Show thank you message with option to provide suggestions
        Swal.fire({
          title: "Thank You for voting!",
          text: "Would you like to share any suggestions with us?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Yes, share suggestions",
          cancelButtonText: "No, thanks",
          confirmButtonColor: "#56b124",
          cancelButtonColor: "#d33"
        }).then((result) => {
          if (result.isConfirmed) {
            setIsOpen(true);
          }
          // Refresh vote counts after voting
          getVote();
        });
      }
    } catch (error) {
      Swal.fire({
        title: "There is an error in posting vote. \nPlease Try again later.",
        confirmButtonColor: "#56b124",
      });
    }
  }

  // const responseGoogle = (response, result) => {
  //   if (response && !response.error) {
  //     const email = response.profileObj.email;
  //     postVote(email, result);
  //   }
  // };

  // get input value
  const getInputValue = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  // vote suggestion
  const voteSuggestion = async () => {
    console.log(inputValue.email)
    console.log(inputValue.name)
    console.log(inputValue.phone)
    console.log(inputValue.message)
    if (
      inputValue.name !== "" && typeof inputValue.name === "string" &&
      inputValue.email !== "" && 
      inputValue.phone !== "" && !isNaN(inputValue.phone) && inputValue.phone.length === 10 &&
      inputValue.message !== ""
    ) {
      try {
        const suggestionUrl = USER_API_ENDPOINTS.SUGGESTION_FORM;

        const data = new FormData();
        data.append("name", inputValue.name);
        data.append("email", inputValue.email);
        data.append("phone", inputValue.phone);
        data.append("message", inputValue.message);

        const headers = {
          "Content-Type": "multipart/form-data",
        };

        await axios.post(suggestionUrl, data, headers);

        setInputValue({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
        setIsOpen(false);
        
        // Show success message
        Swal.fire({
          title: "Thank you for your suggestion!",
          text: "We appreciate your feedback and will consider it.",
          icon: "success",
          confirmButtonColor: "#56b124"
        });
      } catch (err) {
        console.log(err);
        Swal.fire({
          title: "Please enter valid Email",
          confirmButtonColor: "#56b124"
        })
      }
    }
    else {
      Swal.fire({
        title: "Please enter valid fields",
        confirmButtonColor: "#56b124"
      })
    }
  };

  return (
    <>
      <Navbar />

      <div className="main__section">
        {/* Banner Popup */}
        {showBannerPopup && banners && banners.length > 0 && (
          <div className="banner__popup__overlay">
            <div className="banner__popup">
              <button 
                className="banner__popup__close" 
                onClick={closeBannerPopup}
                aria-label="Close banner"
              >
                ×
              </button>
              {(() => {
                const banner = banners[currentBannerIndex];
                const raw = banner.link_url || "";
                const targetUrl = raw && !/^(https?:\/\/|\/\/)/i.test(raw) ? `//${raw}` : raw;

                return (
                  <div
                    className={`banner__popup__content ${banner.image ? "has-image" : "no-image"}`}
                    style={
                      banner.image
                        ? { backgroundImage: `url(${banner.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : {}
                    }
                  >
                    <div className="banner__popup__overlay__content">
                      <h2 className="banner__popup__title">{banner.title}</h2>
                      {banner.description && <p className="banner__popup__desc">{banner.description}</p>}
                      {targetUrl && (
                        <a 
                          className="banner__popup__button" 
                          href={targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {banner.link_text || "Learn More"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
              {banners.length > 1 && (
                <div className="banner__popup__indicators">
                  {banners.map((_, index) => (
                    <span
                      key={index}
                      className={`banner__popup__indicator ${index === currentBannerIndex ? 'active' : ''}`}
                      onClick={() => setCurrentBannerIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Static About Banner - shown when no popup banners or as fallback */}
        <div className="about__top__banner">
          <h1>ABOUT US</h1>
          <p>
            We are a hyperlocal platform to connect the waste producers to the
            waste collectors. Individuals, households, organisations, and
            dealers like Kabadiwalas, collectors, and recyclers all come
            together on a unified online platform. Here, a customer can easily
            find their nearest Kabadiwala and place an order for doorstep waste
            pickup.
          </p>
          <p>
            By leveraging AI, IoT, and IT in the waste management sector, We aim
            to help small local Kabadiwalas grow their businesses with the help
            of technology. By offering a modern solution to treat & manage
            waste, we enable our partners to collect waste efficiently with
            fewer resources.
          </p>
        </div>

        <div className="goal__section">
          <div className="goal" id="ourvision">
            <h1>Our Vision</h1>
            <p>
              Our vision is a world of sustainable consumption and a circular
              economy. We envision becoming a global one-stop shop for the
              recycling and upcycling industry.
            </p>
          </div>
          <div className="goal" id="ourmission">
            <p>
              Our mission is to establish a sustainable recyclable waste
              management system and a clean and pollution-free country by
              creating a hyperlocal platform connecting waste producers and
              waste collectors.
            </p>
            <h1>Our Mission </h1>
          </div>
        </div>

        <div className="certificate__section">
          <h1>Startup India Certificate</h1>
          <img className="certificate" src={startup__certificate} alt="" />
        </div>

        <div className="work__section" id="whatwedo">
          <h1>What We Do?</h1>
          <div className="work">
            {aboutWorkDetails.map((eachDetail, eachDetailIndex) => {
              return (
                <AboutWorkCard
                  key={eachDetailIndex}
                  title={eachDetail.title}
                  description={eachDetail.description}
                />
              );
            })}
          </div>
        </div>

        <div className="voting__section">
          <h1>Your Vote is Valuable</h1>
          <div className="voting">
            <h1>
              We’d love to hear your valuable suggestions! If you feel our
              service adds value to your life, please click on “Yes, I need this
              service”. If you feel you don’t require our services, please click
              on “No, I don’t need this service”. Your response will help us
              understand your requirements better. Please note that we don’t
              collect email addresses by default. Please leave your contact
              details or your suggestions after voting if you’re interested!
            </h1>
            <div className="vote__section">
              <div className="vote">
                {/* <GoogleLogin
                  clientId="839555905156-qpenbug205f1mu5sftdu8skmhmh5pgn9.apps.googleusercontent.com"
                  render={(renderProps) => (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                        renderProps.onClick();
                      }}
                      disabled={renderProps.disabled}
                    >
                      Yes, I need this
                      <br />
                      service
                    </button>
                  )}
                  buttonText="Login"
                  onSuccess={(response) => responseGoogle(response, "yes")}
                  onFailure={(response) => responseGoogle(response, "yes")}
                  cookiePolicy={"single_host_origin"}
                />  */}
                <button name="Yes" value="Yes" onClick={(e) => {postVote(e,"Yes")}}>Yes, I need this
                      <br />
                      service</button>
                <p>
                  {numYes}
                  </p>
              </div>
              <h1>
                Total Vote
                <br />
                <span>
                  {numVotes}
                  </span>
              </h1>
              <div className="vote">
                {/* <GoogleLogin
                  clientId="610021953843-k273bfs6gnb8g04afjsm2uqaav912ngi.apps.googleusercontent.com"
                  render={(renderProps) => (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                        renderProps.onClick();
                      }}
                      disabled={renderProps.disabled}
                      >
                      No, I don't need
                      <br />
                      this service
                    </button>
                  )}
                  buttonText="Login"
                  onSuccess={(response) => responseGoogle(response, "no")}
                  onFailure={(response) => responseGoogle(response, "no")}
                  cookiePolicy={"single_host_origin"}
                />  */}
                <button name="No" value="No" onClick={(e) => {postVote(e,"No")}}>No, I don't need this
                      <br />
                      service</button>
                <p>
                  {numNo}
                  </p>
              </div>
            </div>
          </div>
        </div>

        <div className="join__team__section">
          <div className="left__side">
            <h1>Join Our Team</h1>
          </div>
          <div className="right__side">
            <h1>
              Join us on our mission to revolutionise the waste management
              industry
            </h1>
            <NavLink to="/joinus" className="join__team__button">
              More Info
            </NavLink>
          </div>
        </div>

        <div className="team__member__section" id="ourteam">
          <h1>Our Team Members</h1>
          {teamMember.length !== 0 ? (
            <div className="about__carousel__section">
              <Splide
                className="team__member"
                options={{
                  type: "loop",
                  gap: "1rem",
                  autoplay: true,
                  pauseOnHover: false,
                  resetProgress: false,
                  pagination: false,
                  arrows: false,
                }}
              >
                {teamMember.map((eachMember, eachMemberIndex) => {
                  return (
                    <SplideSlide className="member" key={eachMemberIndex}>
                      <div className="team-member-card">
                        <img src={eachMember.dp} alt="" className="team-member-img" />
                        <div className="team-member-info">
                          <h2>{eachMember.name}</h2>
                          <p>({eachMember.title})</p>
                        </div>
                      </div>
                    </SplideSlide>
                  );
                })}
              </Splide>
            </div>
          ) : null}
        </div>

        <Modal
          className="modal__content"
          overlayClassName="modal__overlay"
          isOpen={isOpen}
          ariaHideApp={false}
        >
          <h1>Any suggestion for us?</h1>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={inputValue.name}
            onChange={getInputValue}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={inputValue.email}
            onChange={getInputValue}
            required
          />
          <input
            type="text"
            placeholder="Phone "
            name="phone"
            value={inputValue.phone}
            onChange={getInputValue}
            required
          />
          <input
            type="text"
            placeholder="Message"
            name="message"
            value={inputValue.message}
            onChange={getInputValue}
            required
          />
          <div>
            <button onClick={voteSuggestion}>Done</button>
            <button
              onClick={() => {
                setInputValue({
                  name: "",
                  email: "",
                  phone: "",
                  message: "",
                });
                setIsOpen(!isOpen);
              }}
            >
              Skip
            </button>
          </div>
        </Modal>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default About;
