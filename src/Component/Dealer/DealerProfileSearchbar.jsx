import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

// css
import "../../Css/DealerProfileSearchbar.css";

// material icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';

// logo
import kabadi__techno__logo from "../../Image/kabadi__techno__logo.png";

// utils
import { USER_API_ENDPOINTS } from "../../utils/apis";
import axios from "axios";

const DealerProfileSearchbar = () => {
  const history = useHistory();
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));
  const dealerName = apiKey['full_name'] || "Dealer";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Define common scrap items for instant results
  const commonScrapItems = [
    { name: "Plastic", keywords: ["plastic", "bottles", "containers"] },
    { name: "Paper", keywords: ["paper", "newspaper", "books", "cardboard"] },
    { name: "Metal", keywords: ["metal", "iron", "steel", "copper", "aluminium", "brass"] },
    { name: "Electronics", keywords: ["electronics", "mobile", "laptop", "computer", "tv"] },
    { name: "Glass", keywords: ["glass", "bottles"] },
    { name: "Clothes", keywords: ["clothes", "fabric", "textiles"] },
  ];

  // Define searchable dealer pages
  const searchableDealerPages = [
    { name: "About", path: "/", keywords: ["about", "company", "info", "information"] },
    { name: "Join Us", path: "/joinus", keywords: ["join", "join us", "signup", "register"] },
    { name: "Contact", path: "/contact", keywords: ["contact", "reach", "phone", "email"] },
    { name: "Dashboard", path: "/dealer/home", keywords: ["home", "dashboard", "main"] },
    { name: "Profile", path: "/dealer/profile", keywords: ["profile", "account", "personal"] },
    { name: "QR Code", path: "/dealer/profile/qr", keywords: ["qr", "qr code", "scan"] },
    { name: "Address", path: "/dealer/address", keywords: ["address", "location"] },
    { name: "Pickup", path: "/dealer/pickup", keywords: ["pickup", "collection", "orders"] },
    { name: "Marketplace", path: "/dealer/marketplace", keywords: ["marketplace", "market", "sell"] },
    { name: "Wallet", path: "/dealer/wallet", keywords: ["wallet", "money", "balance", "earnings"] },
    { name: "Settings", path: "/dealer/settings", keywords: ["settings", "configuration", "setup"] },
    { name: "Add Area", path: "/dealer/settings/addarea", keywords: ["area", "add area", "pincode", "location"] },
    { name: "Set Prices", path: "/dealer/settings/setprice", keywords: ["price", "pricing", "rates", "set price"] },
    { name: "Edit Prices", path: "/dealer/settings/setprice/editprice", keywords: ["edit price", "modify price", "update price"] },
    { name: "Price List", path: "/dealer/settings/setprice/editprice/pricelist", keywords: ["price list", "rate list"] },
    { name: "Document Upload", path: "/dealer/settings/documentupload", keywords: ["document", "upload", "documents"] },
    { name: "Request Category", path: "/dealer/settings/requestcategory", keywords: ["request", "category", "new category"] },
    { name: "Add Employee", path: "/dealer/settings/addemployee", keywords: ["employee", "add employee", "staff"] },
  ];

  // Search functionality
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const lowercaseQuery = query.toLowerCase();

    // Search common scrap items (instant results)
    commonScrapItems.forEach(item => {
      const matchesName = item.name.toLowerCase().includes(lowercaseQuery);
      const matchesKeywords = item.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowercaseQuery)
      );
      
      if (matchesName || matchesKeywords) {
        results.push({
          type: 'category',
          name: item.name,
          path: "/dealer/marketplace",
          description: `View ${item.name} marketplace`
        });
      }
    });

    // Search dealer pages
    searchableDealerPages.forEach(page => {
      const matchesName = page.name.toLowerCase().includes(lowercaseQuery);
      const matchesKeywords = page.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowercaseQuery)
      );
      
      if (matchesName || matchesKeywords) {
        results.push({
          type: 'page',
          name: page.name,
          path: page.path,
          description: `Go to ${page.name} page`
        });
      }
    });

    // Search subcategories via API (dealer-specific endpoint)
    try {
      const response = await axios.get(`${USER_API_ENDPOINTS.GET_SUB_CATEGORY_DEALER_DETAILS}?subcategory_name=${encodeURIComponent(query)}`);
      if (response.data && Array.isArray(response.data)) {
        response.data.slice(0, 5).forEach(item => { // Limit to 5 results
          results.push({
            type: 'subcategory',
            name: item.subcategory_name || item.name,
            path: `/dealer/marketplace?category=${encodeURIComponent(item.subcategory_name || item.name)}`,
            description: `View ${item.subcategory_name || item.name} in marketplace`,
            image: item.subcategory_image || item.image
          });
        });
      }
    } catch (error) {
      console.error("Error searching dealer subcategories:", error);
    }

    setSearchResults(results.slice(0, 8)); // Limit total results to 8
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
    setShowResults(true);
  };

  // Handle search result click
  const handleResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    history.push(result.path);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0]); // Navigate to first result
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dealer__profile__searchbar">
      {/* <span className="logo">
        <img src={kabadi__techno__logo} alt="" />
      </span> */}
      <div className="searchbar" ref={searchRef}>
        <input 
          type="text" 
          placeholder="Search pages, categories, or items..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
        />
        <SearchIcon />
        
        {/* Search Results Dropdown */}
        {showResults && searchQuery.trim() && (
          <div className="search__results">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`search__result__item ${result.type}`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result__content">
                    <div className="result__title">
                      {result.type === 'page' && <span className="result__icon">📄</span>}
                      {result.type === 'category' && <span className="result__icon">🗂️</span>}
                      {result.type === 'subcategory' && result.image && (
                        <img src={result.image} alt={result.name} className="result__image" />
                      )}
                      {result.type === 'subcategory' && !result.image && <span className="result__icon">📦</span>}
                      <span className="result__name">{result.name}</span>
                    </div>
                    <div className="result__description">{result.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search__result__item no-results">
                <div className="result__content">
                  <div className="result__title">No results found</div>
                  <div className="result__description">Try searching for different keywords</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <p>
        Welcome {dealerName !== undefined ? dealerName : null}
        <AccountCircleIcon />
      </p>
    </div>
  );
};

export default DealerProfileSearchbar;