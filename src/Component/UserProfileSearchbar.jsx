import React, { useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import "../Css/UserProfileSearchbar.css";

// Material icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import Badge from '@mui/material/Badge';
import { useDispatch, useSelector } from "react-redux";
import { USER_API_ENDPOINTS } from "../utils/apis";
import axios from "axios";

const UserProfileSearchbar = () => {
  const apiKey = JSON.parse(localStorage.getItem("KTMauth"));   // Logged-in user
  const gAuth = JSON.parse(localStorage.getItem("KTMgauth"));   // Guest
  const history = useHistory();

  const dispatch = useDispatch();
  const [hasCartItems, setHasCartItems] = useState(false);
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

  // Define searchable pages
  const searchablePages = [
    { name: "About", path: "/", keywords: ["about", "company", "info", "information"] },
    { name: "Join Us", path: "/joinus", keywords: ["join", "join us", "signup", "register", "become dealer"] },
    { name: "Sell Items", path: "/sell", keywords: ["sell", "selling", "items", "scrap", "waste", "recycle", "metal", "plastic", "paper", "cardboard", "iron", "steel", "copper", "aluminium", "electronics", "books", "newspaper"] },
    { name: "Sell Items", path: "/sell/sellitem", keywords: ["sellitem", "add items", "choose items", "select scrap"] },
    { name: "FAQ", path: "/faq", keywords: ["faq", "questions", "help", "support"] },
    { name: "Contact", path: "/contact", keywords: ["contact", "reach", "phone", "email"] },
    { name: "Profile", path: "/sell/user/profile", keywords: ["profile", "account", "personal", "dashboard"] },
    { name: "Cart", path: "/sell/cart", keywords: ["cart", "shopping", "items", "order", "checkout"] },
    { name: "Wallet", path: "/sell/user/wallet", keywords: ["wallet", "money", "balance", "earnings", "payment"] },
    { name: "Pickup", path: "/sell/user/pickup", keywords: ["pickup", "collection", "schedule", "delivery"] },
    { name: "QR Code", path: "/sell/user/qr", keywords: ["qr", "qr code", "scan", "quick response"] },
    { name: "Address", path: "/sell/user/address", keywords: ["address", "location", "delivery", "pickup address"] },
    { name: "Marketplace", path: "/marketplace/1/", keywords: ["marketplace", "market", "buy", "purchase"] },
  ];

  // Check if user has cart items
  useEffect(() => {
    if (apiKey?.customer_id) {
      axios.get(`${USER_API_ENDPOINTS.VIEW_CART}${apiKey.customer_id}/`)
        .then((res) => {
          // Check if cart has items (excluding the total summary object)
          const cartItems = res.data.slice(0, -1);
          setHasCartItems(cartItems.length > 0);
        })
        .catch((err) => {
          console.error("Error fetching cart:", err);
          setHasCartItems(false);
        });
    }
  }, [apiKey]);

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
          path: "/sell",
          description: `Sell ${item.name} items`
        });
      }
    });

    // Search pages
    searchablePages.forEach(page => {
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

    // Search subcategories via API
    try {
      const response = await axios.get(`${USER_API_ENDPOINTS.GET_ALL_SUB_CATEGORY_LIST_BY_KEYWORD}?keyword=${encodeURIComponent(query)}`);
      if (response.data && Array.isArray(response.data)) {
        response.data.slice(0, 5).forEach(item => { // Limit to 5 results
          results.push({
            type: 'subcategory',
            name: item.subcategory_name || item.name,
            path: `/sell/sellitem?category=${encodeURIComponent(item.subcategory_name || item.name)}`,
            description: `Sell ${item.subcategory_name || item.name}`,
            image: item.subcategory_image || item.image
          });
        });
      }
    } catch (error) {
      console.error("Error searching subcategories:", error);
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
    <div className="user__profile__searchbar">
      <div className="searchbar" ref={searchRef}>
        <input 
          type="text" 
          placeholder="Search pages, items..." 
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchSubmit}
          onFocus={() => searchQuery && setShowResults(true)}
        />
        <SearchIcon />
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="search-result-content">
                  {result.image && (
                    <img 
                      src={result.image} 
                      alt={result.name} 
                      className="search-result-image"
                    />
                  )}
                  <div className="search-result-text">
                    <div className="search-result-name">{result.name}</div>
                    <div className="search-result-description">{result.description}</div>
                  </div>
                </div>
                <div className={`search-result-type ${result.type}`}>{result.type}</div>
              </div>
            ))}
          </div>
        )}
        
        {showResults && searchQuery && searchResults.length === 0 && (
          <div className="search-results">
            <div className="search-no-results">
              No results found for "{searchQuery}"
            </div>
          </div>
        )}
      </div>

      <div className="profile">
        <p>
          {apiKey?.full_name
            ? `Welcome ${apiKey.full_name}`
            : gAuth !== null
              ? "Welcome Guest"
              : "Loading..."}
        </p>

        <div>
          <NavLink to="/sell/user/profile" className="profile__icon">
            <AccountCircleIcon />
          </NavLink>

          <NavLink to="/sell/cart" className="cart__icon cart__icon-with-label">
            <ShoppingCartIcon />
            {hasCartItems && (
              <span className="new-label">new</span>
            )}
          </NavLink>


        </div>
      </div>
    </div>
  );
};

export default UserProfileSearchbar;
