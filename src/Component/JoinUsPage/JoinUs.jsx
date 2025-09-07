import React, { useEffect, useState } from "react";
import axios from "axios";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";

// css
import "../../Css/JoinUs.css";
import "../../Css/TeamMemberCard.css";
import "../../App.css";

// component
import Navbar from "../Navbar";
import JoinUsComponent from "./JoinUsComponent";
import MainFooter from "../../Component/Footer/MainFooter";
import TermFooter from "../../Component/Footer/TermFooter";

// join us details
import { JoinUsDetails } from "./JoinUsDetails";

// api url
import { apiUrl } from "../../Private";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const JoinUs = () => {
  const [joinUsDetails, setJoinUsDetails] = useState(JoinUsDetails);
  const [happyTeamMember, setHappyTeamMember] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFormUrl, setCurrentFormUrl] = useState('');
  const [currentFormTitle, setCurrentFormTitle] = useState('');

  // get happy team member data
  useEffect(() => {
    axios
      .get(USER_API_ENDPOINTS.WORKING_TEAM_MEMBERS)
      .then((response) => {
        setHappyTeamMember(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // get public banners for join us page from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        console.log('🔍 Fetching banners from:', USER_API_ENDPOINTS.PUBLIC_INTERNSHIP_BANNER_LIST);
        const response = await axios.get(USER_API_ENDPOINTS.PUBLIC_INTERNSHIP_BANNER_LIST);
        console.log('📦 Raw API Response:', response);
        console.log('📦 Response Data:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('✅ Found', response.data.length, 'banners in API response');
          
          // Show all banners from the API response
          setBanners(response.data);
          console.log('🎯 Setting all banners:', response.data);
        } else {
          console.log('❌ API response is not an array:', response.data);
        }
      } catch (error) {
        console.error("❌ Failed to load banners:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
    };

    loadBanners();
  }, []);

  // Banner auto-rotate timer
  useEffect(() => {
    let bannerTimer;

    if (banners.length > 1) {
      bannerTimer = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          prevIndex >= banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Rotate every 5 seconds
    }

    return () => {
      if (bannerTimer) clearInterval(bannerTimer);
    };
  }, [banners.length]);

  // join us component open close
  const openClose = (index) => {
    const newJoinUsDetails = joinUsDetails.map(
      (eachDetail, eachDetailIndex) => {
        if (eachDetailIndex === index) {
          eachDetail.isOpen = !eachDetail.isOpen;
        } else {
          eachDetail.isOpen = false;
        }
        return eachDetail;
      }
    );
    setJoinUsDetails(newJoinUsDetails);
  };

  // Function to handle form modal
  const handleFormClick = (linkUrl, title) => {
    // Extract iframe src from the full iframe tag if needed
    let formUrl = linkUrl;
    
    // Check if linkUrl contains an iframe tag and extract the src
    const iframeMatch = linkUrl.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
      formUrl = iframeMatch[1];
    }
    
    // If it's a Google Forms edit link, convert to viewform
    if (formUrl.includes('docs.google.com/forms') && formUrl.includes('/edit')) {
      formUrl = formUrl.replace('/edit', '/viewform');
    }
    
    // Add necessary parameters for better Google Forms display
    if (formUrl.includes('docs.google.com/forms')) {
      const url = new URL(formUrl);
      url.searchParams.set('embedded', 'true');
      url.searchParams.set('usp', 'pp_url');
      // Remove any width/height constraints that might interfere
      url.searchParams.delete('width');
      url.searchParams.delete('height');
      formUrl = url.toString();
    }
    
    setCurrentFormUrl(formUrl);
    setCurrentFormTitle(title || 'Form');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentFormUrl('');
    setCurrentFormTitle('');
  };

  return (
    <>
      <Navbar />

      <div className="main__section">
        <div className="join__us__top__banner ">
          {/* by using ! , the property is not applied*/}
          <h1 className="">JOIN OUR TEAM</h1>
          <p>
            "Alone, we can do so little...
            <br />
            Together, we can do so much"
          </p>
          <span>~ Helen Keller</span>
        </div>

        {/* Admin Banner Section */}
        {banners && banners.length > 0 && (
          <div className="admin__banner__section">
            {(() => {
              const banner = banners[currentBannerIndex];
              const raw = banner.link_url || "";
              const targetUrl = raw && !/^(https?:\/\/|\/\/)/i.test(raw) ? `//${raw}` : raw;

              return (
                <div
                  className={`admin__banner__content ${banner.image ? "has-image" : "no-image"}`}
                  style={
                    banner.image
                      ? { backgroundImage: `url(${banner.image})` }
                      : {}
                  }
                >
                  <div className="admin__banner__overlay">
                    <h2 className="admin__banner__title">{banner.title}</h2>
                    {banner.description && <p className="admin__banner__desc">{banner.description}</p>}
                    {targetUrl && (
                      <button 
                        className="admin__banner__button" 
                        onClick={() => handleFormClick(targetUrl, banner.title)}
                      >
                        {banner.link_text || "Learn More"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            {banners.length > 1 && (
              <div className="admin__banner__indicators">
                {banners.map((_, index) => (
                  <span
                    key={index}
                    className={`admin__banner__indicator ${index === currentBannerIndex ? 'active' : ''}`}
                    onClick={() => setCurrentBannerIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="join__us__section" id="joinourteam">
          {joinUsDetails.map((eachDetail, eachDetailIndex) => {
            return (
              <JoinUsComponent
                key={eachDetailIndex}
                title={eachDetail.title}
                headline={eachDetail.headline}
                description={eachDetail.description}
                disclaimer={eachDetail.disclaimer}
                component={eachDetail.component}
                isOpen={eachDetail.isOpen}
                openClose={openClose.bind(this, eachDetailIndex)}
              />
            );
          })}
        </div>

        <div className="main__section__carousel">
          <h1>Our Happy Members</h1>
          {happyTeamMember.length !== 0 ? (
            <div className="carousel__section">
              <Splide
                className="main__carousel"
                options={{
                  type: "loop",
                  gap: "1rem",
                  autoplay: true,
                  pauseOnHover: false,
                  resetProgress: false,
                  pagination: false,
                  arrows: false,
                  perPage: 1,
                  perMove: 1,
                  focus: 'center',
                  trimSpace: false,
                }}
              >
                {happyTeamMember.map((eachDetails, eachDetailsIndex) => {
                  return (
                    <SplideSlide key={eachDetailsIndex} className="carousel">
                      <div className="team-member-card sidewise">
                        <img src={eachDetails.dp} alt="" className="team-member-img" />
                        <div className="team-member-info">
                          <h2>{eachDetails.feedback}</h2>
                          <p>{eachDetails.name}</p>
                        </div>
                      </div>
                    </SplideSlide>
                  );
                })}
              </Splide>
            </div>
          ) : null}
        </div>
      </div>

      <MainFooter />

      <TermFooter />

      {/* Form Modal */}
      {showFormModal && (
        <div className="form-modal-overlay" onClick={closeFormModal}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>{currentFormTitle}</h2>
              <button 
                className="form-modal-close" 
                onClick={closeFormModal}
                aria-label="Close form"
              >
                ×
              </button>
            </div>
            <div className="form-modal-body">
              <iframe 
                src={currentFormUrl} 
                width="100%" 
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0"
                title={currentFormTitle}
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

export default JoinUs;
