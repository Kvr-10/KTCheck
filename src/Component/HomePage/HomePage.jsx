import React, { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "../../Css/HomePage.css";
import "../../Css/responsive.css";
import { Link, useHistory } from "react-router-dom";
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";
import { USER_API_ENDPOINTS } from "../../utils/apis";
import Swal from 'sweetalert2';

import project1 from "../../Images/project1.png";
import kabadiWala from "../../Images/kabadiWala.png"
import servicessImg from "../../Images/servicess.PNG"
import founderImg from "../../Images/founder.png"
import servicesImg from "../../Images/services.png"
import plasticImg from "../../Images/plastic.png"




const HomePage = () => {
  const history = useHistory();
  
  // button class between kabadi and collector
  const [active, setActive] = useState(true);

  // Waste clock data
  const [wasteData, setWasteData] = useState({
    plastic: 684494,
    paper: 523876,
    metal: 312456,
    glass: 189234
  });

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch news data from API
    const fetchNewsData = async () => {
      try {
        const response = await fetch(USER_API_ENDPOINTS.HOMEPAGE_NEWS);
        if (response.ok) {
          const data = await response.json();
          setNewsData(data);
        } else {
          console.error('Failed to fetch news data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching news data:', error);
      }
    };

    fetchNewsData();

    // Update waste data every second to simulate real-time
    const interval = setInterval(() => {
      setWasteData(prev => ({
        plastic: prev.plastic + Math.floor(Math.random() * 10) + 1,
        paper: prev.paper + Math.floor(Math.random() * 8) + 1,
        metal: prev.metal + Math.floor(Math.random() * 5) + 1,
        glass: prev.glass + Math.floor(Math.random() * 3) + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update profile_type when active state changes
  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      profile_type: active ? "kabaadiwaale" : "collectors"
    }));
  }, [active]);

  // Handle contact form submission
  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      const response = await fetch(USER_API_ENDPOINTS.HOMEPAGE_CONTACT_FORM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues)
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log('Contact form submitted successfully:', data);
        
        // Success SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Your message has been sent successfully!',
          icon: 'success',
          confirmButtonText: 'Great!',
          confirmButtonColor: '#E17F0B',
          background: '#fff',
          color: '#333'
        });

        setFormValues({
          name: "",
          phone_number: "",
          email: "",
          message: "",
          profile_type: active ? "kabaadiwaale" : "collectors"
        });
      } else {
        console.error('Error submitting contact form:', response.status);
        
        // Error SweetAlert
        Swal.fire({
          title: 'Error!',
          text: 'There was an error submitting your message. Please try again.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#E17F0B',
          background: '#fff',
          color: '#333'
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      
      // Network Error SweetAlert
      Swal.fire({
        title: 'Network Error!',
        text: 'Please check your connection and try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
        confirmButtonColor: '#E17F0B',
        background: '#fff',
        color: '#333'
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle consultation form submission
  const handleConsultationFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingConsultation(true);

    try {
      const response = await fetch(USER_API_ENDPOINTS.HOMEPAGE_CONSULTATION_FORM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValuess)
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log('Consultation form submitted successfully:', data);
        
        // Success SweetAlert
        Swal.fire({
          title: 'Thank You!',
          text: 'Your consultation request has been sent successfully! Our team will contact you soon.',
          icon: 'success',
          confirmButtonText: 'Excellent!',
          confirmButtonColor: '#E17F0B',
          background: '#fff',
          color: '#333'
        });

        setFormValuess({
          name: "",
          phone_number: "",
          email: "",
          company_or_organization: "",
          message: "",
          city: ""
        });
      } else {
        console.error('Error submitting consultation form:', response.status);
        
        // Error SweetAlert
        Swal.fire({
          title: 'Submission Failed!',
          text: 'There was an error submitting your consultation request. Please try again.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#E17F0B',
          background: '#fff',
          color: '#333'
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      
      // Network Error SweetAlert
      Swal.fire({
        title: 'Connection Error!',
        text: 'Please check your internet connection and try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
        confirmButtonColor: '#E17F0B',
        background: '#fff',
        color: '#333'
      });
    } finally {
      setIsSubmittingConsultation(false);
    }
  };

  // Handle news article click
  const handleNewsClick = (newsId, e) => {
    // Prevent navigation if clicking on external link
    if (e.target.closest('a[href^="http"]')) {
      return;
    }
    history.push(`/home/news/${newsId}`);
  };

  // State for news data
  const [newsData, setNewsData] = useState([]);

  const [formValues, setFormValues] = useState({
    name: "",
    phone_number: "",
    email: "",
    message: "",
    profile_type: "kabaadiwaale" // default to kabaadiwaale
  });
  
  const [formValuess, setFormValuess] = useState({
    name: "",
    phone_number: "",
    email: "",
    company_or_organization: "",
    message: "",
    city: ""
  });

  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Function to handle survey modal
  const handleSurveyClick = () => {
    setShowSurveyModal(true);
  };

  const closeSurveyModal = () => {
    setShowSurveyModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="home_page">
        {/*<Link to="/page5">
      <button>Event</button>
    </Link>
    <Link to="/page6">
      <button>News</button>
    </Link> */}
        {/*HERO SECTION*/}
        <div className="heroSection__home_page__">
          <div className="mainSection__home_page__">
            <div className="mainSection_left__home_page__">
                <div style={{ paddingLeft: '35px' }}>
                  <quote style={{ fontSize: '1.3rem', lineHeight: '1.4', fontWeight: 500 }}>
                    Your Behavior Shapes Recycling — Take the Survey,
                    Build a Greener Tomorrow.
                    <br />
                  </quote>
                </div>
            </div>
            <div className="mainSection_right__home_page__">
              {/* <Link to="/">
            <button className="button__home_page"> About Us </button>
          </Link> */}
              <button 
                className="button__home_page"
                onClick={handleSurveyClick}
              >
                Survey
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE FOR KABADIWALA */}
        <div className="Kabadiwala__home_page">
          <div className="mainKabadiwala__home_page">
            <div className="mainKabadiwalaLeft__home_page">
              <div className="KabadiwalaButtons__home_page">
                <div className="button outsideKabadiwalabtn__home_page">
                  <button
                    className={
                      active
                        ? "btn kabaadiwalabtn__home_page active-button"
                        : "btn collectorbtn__home_page"
                    }
                    onClick={() => setActive(true)}
                  >
                    Kabaadiwaale
                  </button>
                </div>
                <div className="button outsideCollectorbtn__home_page">
                  <button
                    className={
                      !active
                        ? "btn kabaadiwalabtn__home_page active-button"
                        : "btn collectorbtn__home_page"
                    }
                    onClick={() => setActive(false)}
                  >
                    Collectors
                  </button>
                </div>
              </div>
              <div className="MessageKabadiwala__home_page">
                <div className="headingMessageKabadiwala__home_page">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="58"
                    height="58"
                    viewBox="0 0 58 58"
                    fill="none"
                  >
                    <circle cx="29" cy="29" r="29" fill="#E17F0B" />
                  </svg>
                  <h1>{active ? "Message for Kabaadiwaale" : "Message for Collectors"}</h1>
                </div>

                {active ? (
                  // Kabaadiwaale Message
                  <>
                    <div className="topMessage__home_page">
                        <p>
                          <b>“You are the first heroes of recycling.</b><br />
                          Your continuous efforts to collect waste and push it into the recycling chain make you the true initiators of the recycling ecosystem. We deeply thank you for your dedication.<br />
                          Kabadi Techno stands with you — to empower your business with technology, increase your income, and give you the recognition you deserve. Together, let’s strengthen our recycling system, make our environment clean and green, and support a thriving circular economy.”
                        </p>
                    </div>
                    <div className="AboutMessage__home_page">
                        {/* ...existing code... */}
                        {/* Message moved to top section above for clarity and conciseness */}
                    </div>
                  </>
                ) : (
                  // Collectors Message
                  <>
                    <div className="topMessage__home_page">
                        <p>
                          <b>“You are the backbone of the recycling ecosystem.</b><br />
                          Through your hard work in building supply chains and ensuring recyclable waste reaches the right destination, you keep the recycling process alive and growing. We salute your role and efforts.<br />
                          Kabadi Techno is here to support you with digital tools, better networks, and innovative systems to scale your impact. Let’s join hands to improve recycling, protect our environment, and build a clean, green, and sustainable future powered by the circular economy.”
                        </p>
                    </div>
                    <div className="AboutMessage__home_page">
                        {/* ...existing code... */}
                        {/* Message moved to top section above for clarity and conciseness */}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mainKabadiwalaRight__home_page">
              <div className="kabadiwalaImage__home_page">
                <img

                  src={kabadiWala}
                  alt="kabadiwala"
                />
              </div>

              <form className="form" onSubmit={handleContactFormSubmit}>
                <label>
                  Name <br />
                  <input
                    type="text"
                    placeholder=""
                    name="name"
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues({ ...formValues, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Phone Number <br />
                  <input
                    type="tel"
                    placeholder=""
                    name="phone_number"
                    value={formValues.phone_number}
                    onChange={(e) =>
                      setFormValues({ ...formValues, phone_number: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Email <br />
                  <input
                    type="email"
                    placeholder=""
                    name="email"
                    value={formValues.email}
                    onChange={(e) =>
                      setFormValues({ ...formValues, email: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Message
                  <br />
                  <input
                    type="text"
                    className="message__home_page"
                    placeholder=""
                    name="message"
                    value={formValues.message}
                    onChange={(e) =>
                      setFormValues({ ...formValues, message: e.target.value })
                    }
                    required
                  />
                </label>
                <div className="button outsideKabadiwalabtn">
                  <button 
                    type="submit" 
                    className="btn kabaadiwalabtn"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/*Founder */}
        <div className="founder__home_page">
          <div className="mainFounder__home_page">
            <div className="founder_heading__home_page">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                position: 'relative'
              }}>
                {/* Accent bar */}
                <div style={{
                  width: '6px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #E17F0B 0%, #F7B267 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(225,127,11,0.15)',
                  flexShrink: 0
                }}></div>
                {/* Founder icon */}
                {/* <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#E17F0B" />
                  <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Arial" dy=".3em">KS</text>
                </svg> */}
                {/* Title */}
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#E17F0B',
                  margin: 0,
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 8px rgba(225,127,11,0.08)'
                }}>
                  Message from the Founder – Kuldeep Singh
                </h2>
              </div>
              <div className="founder_message__home_page">
                <h1>Kuldeep Singh</h1>
                <p>
                  <b>Kabadi Techno was born out of a passion to solve India’s waste problem.</b><br />
                  From personal experiences and challenges, I realized that recycling is not just a necessity but a responsibility towards our future generations. My dream is to create the world’s best ecosystem for recycling — where Kabadiwalas, collectors, recyclers, and citizens come together, supported by modern technology, to protect our environment.<br />
                  Through Kabadi Techno, we want to ensure that no resource goes to waste and every bit of recyclable material finds its rightful place in the circular economy. Together, we can make India a global leader in sustainable recycling.”
                </p>
              </div>
            </div>
            <div className="founder_image__home_page">

              <img src={founderImg} />
            </div>
          </div>
        </div>

        {/*CLOCK*/}
        <div className="wasteContainer__home_page">
          <div className="mainWasteContainer__home_page">
            <div className="waste_clock_header">
              <div className="waste_clock_title">
                <h1>WASTE CLOCK</h1>
              </div>
              <div className="animated_clock">
                <svg className="clock_svg" viewBox="0 0 200 200" width="200" height="200">
                  {/* Clock face */}
                  <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="4" strokeDasharray="15,5" />
                  {/* Hour markers */}
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1="100"
                      y1="15"
                      x2="100"
                      y2="30"
                      stroke="white"
                      strokeWidth="4"
                      transform={`rotate(${i * 30} 100 100)`}
                    />
                  ))}
                  {/* Minute markers */}
                  {[...Array(60)].map((_, i) => (
                    i % 5 !== 0 && (
                      <line
                        key={`minute-${i}`}
                        x1="100"
                        y1="15"
                        x2="100"
                        y2="22"
                        stroke="white"
                        strokeWidth="1"
                        opacity="0.7"
                        transform={`rotate(${i * 6} 100 100)`}
                      />
                    )
                  ))}
                  {/* Hour hand */}
                  <line
                    className="clock_hand clock_hour_hand"
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="50"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Minute hand */}
                  <line
                    className="clock_hand clock_minute_hand"
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="35"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Center dot */}
                  <circle cx="100" cy="100" r="10" fill="white" />
                </svg>
              </div>
            </div>

            <div className="wasteContainer__home_page">
              <div className="mainWasteContainer__home_page">
                <div className="wasteCard__home_page">
                  <div className="wasteCards__home_page">
                    <img src={plasticImg} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="110"
                      viewBox="0 0 517 110"
                      fill="none"
                      style={{ maxWidth: '400px' }}
                    >
                      <path
                        d="M0.948242 18.4928C0.948242 8.55169 9.00712 0.492798 18.9482 0.492798H498.093C511.446 0.492798 520.151 14.522 514.22 26.4865L478.026 99.5098C474.988 105.639 468.739 109.516 461.898 109.516H18.9482C9.00712 109.516 0.948242 101.457 0.948242 91.5161V18.4928Z"
                        fill="#112F34"
                      />
                    </svg>
                    <div className="waste_card_text_overlay">
                      <h3>Plastic</h3>
                      <div className="waste_counter">
                        <span className="counter_number">{wasteData.plastic.toLocaleString()}</span>
                        <span className="counter_unit">kgs</span>
                        <span className="counter_period">/ hr</span>
                      </div>
                      <button className="know_more_btn">Know more</button>
                    </div>
                  </div>

                  <div className="wasteCards__home_page">
                    <img src={plasticImg} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="110"
                      viewBox="0 0 517 110"
                      fill="none"
                      style={{ maxWidth: '400px' }}
                    >
                      <path
                        d="M0.948242 18.4928C0.948242 8.55169 9.00712 0.492798 18.9482 0.492798H498.093C511.446 0.492798 520.151 14.522 514.22 26.4865L478.026 99.5098C474.988 105.639 468.739 109.516 461.898 109.516H18.9482C9.00712 109.516 0.948242 101.457 0.948242 91.5161V18.4928Z"
                        fill="#112F34"
                      />
                    </svg>
                    <div className="waste_card_text_overlay">
                      <h3>Paper</h3>
                      <div className="waste_counter">
                        <span className="counter_number">{wasteData.paper.toLocaleString()}</span>
                        <span className="counter_unit">kgs</span>
                        <span className="counter_period">/ hr</span>
                      </div>
                      <button className="know_more_btn">Know more</button>
                    </div>
                  </div>

                  <div className="wasteCards__home_page">
                    <img src={plasticImg} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="110"
                      viewBox="0 0 517 110"
                      fill="none"
                      style={{ maxWidth: '400px' }}
                    >
                      <path
                        d="M0.948242 18.4928C0.948242 8.55169 9.00712 0.492798 18.9482 0.492798H498.093C511.446 0.492798 520.151 14.522 514.22 26.4865L478.026 99.5098C474.988 105.639 468.739 109.516 461.898 109.516H18.9482C9.00712 109.516 0.948242 101.457 0.948242 91.5161V18.4928Z"
                        fill="#112F34"
                      />
                    </svg>
                    <div className="waste_card_text_overlay">
                      <h3>Metal</h3>
                      <div className="waste_counter">
                        <span className="counter_number">{wasteData.metal.toLocaleString()}</span>
                        <span className="counter_unit">kgs</span>
                        <span className="counter_period">/ hr</span>
                      </div>
                      <button className="know_more_btn">Know more</button>
                    </div>
                  </div>

                  <div className="wasteCards__home_page">
                    <img src={plasticImg} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="110"
                      viewBox="0 0 517 110"
                      fill="none"
                      style={{ maxWidth: '400px' }}
                    >
                      <path
                        d="M0.948242 18.4928C0.948242 8.55169 9.00712 0.492798 18.9482 0.492798H498.093C511.446 0.492798 520.151 14.522 514.22 26.4865L478.026 99.5098C474.988 105.639 468.739 109.516 461.898 109.516H18.9482C9.00712 109.516 0.948242 101.457 0.948242 91.5161V18.4928Z"
                        fill="#112F34"
                      />
                    </svg>
                    <div className="waste_card_text_overlay">
                      <h3>Glass</h3>
                      <div className="waste_counter">
                        <span className="counter_number">{wasteData.glass.toLocaleString()}</span>
                        <span className="counter_unit">kgs</span>
                        <span className="counter_period">/ hr</span>
                      </div>
                      <button className="know_more_btn">Know more</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UPDATES */}
        <div className="newBlog__home_page">
          <div className="main_newBlog__home_page">
            <h1>News, Blogs and Updates</h1>

            <Splide
              className="new_blog_card__home_page"
              options={{
                arrows: false,
                perPage: 2,
                gap: "7px",
                breakpoints: {
                  1200: { perPage: 2, gap: "1rem" },
                  768: { perPage: 1 },
                },
              }}
            >
              {newsData.length > 0 ? newsData.map((newsItem, index) => {
                // Truncate description to first 100 characters
                const truncatedDescription = newsItem.description.length > 100 
                  ? newsItem.description.substring(0, 100) + "..." 
                  : newsItem.description;

                return (
                  <SplideSlide key={newsItem.id}>
                    <div 
                      className="new_blog_cards__home_page" 
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => handleNewsClick(newsItem.id, e)}
                    >
                      {/* Professional accent bar */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                        zIndex: 1
                      }}></div>
                      
                      {/* Latest Badge - Top Left Corner (only for first item) */}
                      {index === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '16px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          zIndex: 3,
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          animation: 'latestPulse 1s infinite',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                        }}>
                          Latest
                        </div>
                      )}
                      
                      {/* Category Badge - Top Right Corner */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        zIndex: 2,
                        background: newsItem.category === 'News' 
                          ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
                          : newsItem.category === 'Blogs'
                          ? 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
                          : 'linear-gradient(135deg, #ecfdf5 0%, #bbf7d0 100%)',
                        color: newsItem.category === 'News' 
                          ? '#1e40af' 
                          : newsItem.category === 'Blogs'
                          ? '#7c3aed'
                          : '#059669',
                        border: newsItem.category === 'News' 
                          ? '1px solid #bfdbfe' 
                          : newsItem.category === 'Blogs'
                          ? '1px solid #e9d5ff'
                          : '1px solid #bbf7d0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        {newsItem.category}
                      </div>
                      <div className="news_image_container">
                        <img 
                          src={newsItem.image} 
                          alt={newsItem.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px 8px 0 0',
                            filter: 'brightness(0.95) contrast(1.05)'
                          }}
                        />
                      </div>
                      <div className="news_content" style={{
                        paddingLeft: '24px'
                      }}>
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          margin: '12px 0 8px 0',
                          color: '#1e293b',
                          lineHeight: '1.4'
                        }}>
                          {newsItem.title}
                        </h3>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                          lineHeight: '1.5',
                          margin: '0 0 12px 0'
                        }}>
                          {truncatedDescription}
                        </p>
                        {newsItem.link_url && (
                          <a 
                            href={newsItem.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              gap: '4px',
                              transition: 'color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
                            onMouseOut={(e) => e.target.style.color = '#3b82f6'}
                          >
                            {newsItem.link_text || 'Read More'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                              <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </SplideSlide>
                );
              }) : (
                <SplideSlide>
                  <div className="new_blog_cards__home_page" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '300px',
                    color: '#64748b',
                    fontSize: '1.1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📰</div>
                      <p>No news articles available</p>
                    </div>
                  </div>
                </SplideSlide>
              )}
            </Splide>
          </div>
        </div>

        {/*SERVICES */}
        <div className="services__home_page">
          <div className="main_services__home_page">
            <div className="main_services_left__home_page">
              <div className="services_heading__home_page">
                <h1>Consultancy Services</h1>
                <p>
                  Unlock Your Waste Management Potential with Kabadi Techno
                  Consultancy Services.
                </p>
              </div>
              <div className="services_para__home_page">
                <p>
                  Our handpicked agents bring expertise and a passion for positive
                  change. From waste reduction to compliance, we cover a wide
                  range of areas, staying up-to-date with the latest trends and
                  technologies.
                </p>
              </div>
              <img src={servicesImg} />
              <p>
                Contact us today and let our expert consultants propel your
                success!
              </p>
            </div>
            <div className="main_services_right__home_page">
              <div className="services_form_container">
                <div className="services_form_header">
                  <h2>Contact us today and let our expert consultants propel your success!</h2>
                </div>
                <form className="services_contact_form" onSubmit={handleConsultationFormSubmit}>
                  <div className="form_field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      className="ServicesInput"
                      type="text"
                      placeholder=""
                      name="name"
                      value={formValuess.name}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form_field">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      className="ServicesInput"
                      type="tel"
                      placeholder=""
                      name="phone_number"
                      value={formValuess.phone_number}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, phone_number: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form_field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      className="ServicesInput"
                      type="email"
                      placeholder=""
                      name="email"
                      value={formValuess.email}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form_field">
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      className="ServicesInput"
                      type="text"
                      placeholder=""
                      name="company_or_organization"
                      value={formValuess.company_or_organization}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, company_or_organization: e.target.value })
                      }
                    />
                  </div>

                  <div className="form_field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      className="ServicesInput"
                      type="text"
                      placeholder=""
                      name="city"
                      value={formValuess.city}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, city: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form_field">
                    <label htmlFor="message">Message (Optional)</label>
                    <textarea
                      id="message"
                      className="ServicesInput message_textarea"
                      placeholder=""
                      name="message"
                      rows="4"
                      value={formValuess.message}
                      onChange={(e) =>
                        setFormValuess({ ...formValuess, message: e.target.value })
                      }
                    />
                  </div>

                  <div className="form_submit">
                    <button 
                      type="submit" 
                      className="services_submit_btn"
                      disabled={isSubmittingConsultation}
                    >
                      {isSubmittingConsultation ? 'Submitting...' : 'GET STARTED'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/*SUPPORT*/}
        {/*
        <div className="supportContainer__home_page">
          <div className="main_supportContainer__home_page">
            <div className="main_supportContainerLeft__home_page">
              <img src={servicessImg} />
            </div>
            <div className="main_supportContainerRight__home_page">
              <div className="rightTopMain_supportContainer__home_page">
                <h1>
                  Support a Cleaner Future:
                  <br />
                  <span>Donate to Waste Management Initiatives Today!</span>{" "}
                </h1>
              </div>
              <div className="rightBottomMain_supportContainer__home_page">
                <p>
                  By donating to our cause, you directly contribute to vital
                  projects that address waste reduction, recycling, education, and
                  community engagement. Together, we can tackle the pressing
                  challenges of waste management and build a brighter future for
                  generations to come.
                </p>
                <div className="support_button__home_page">
                  <Link to="/donation">
                    <button className="button__home_page">
                      Monetary Donation
                    </button>
                  </Link>

                  <Link to="/Wastedonation">
                    {" "}
                    <button className="button__home_page">Waste Donation</button>
                  </Link>
                </div>
                <p>7,803 people have donated!</p>
              </div>
            </div>
          </div>
        </div>*/}

      </div>
      <MainFooter />
      <TermFooter />

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="survey-modal-overlay" onClick={closeSurveyModal}>
          <div className="survey-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="survey-modal-header">
              <h2>Customer Survey</h2>
              <button 
                className="survey-modal-close" 
                onClick={closeSurveyModal}
                aria-label="Close survey"
              >
                ×
              </button>
            </div>
            <div className="survey-modal-body">
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSd6euQZhe1-EvZH9U8IY5bdCDlCl2O82lOYdLRTcRneR46mqA/viewform?embedded=true" 
                width="100%" 
                height="600" 
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0"
                title="Customer Survey"
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>
      )}

    </>

  );
};

export default HomePage;
