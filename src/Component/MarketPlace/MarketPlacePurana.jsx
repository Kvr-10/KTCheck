// import React, { useEffect, useState } from "react";
// import Modal from "react-modal";
// import axios from "axios";
// import Swal from "sweetalert2";

// // css
// import "../../Css/SellItem.css";
// import "../../App.css";

// // component
// import Navbar from "../Navbar";
// import UserProfileSearchbar from "../UserProfileSearchbar";
// import ChangePincode from "../ChangePincode";
// import MarketPlaceCard from "./MarketPlaceCard";
// import DealerContactCard from "../SellItemPage/DealerContactCard";
// import MainFooter from "../Footer/MainFooter";
// import TermFooter from "../Footer/TermFooter";

// // material ui component
// import { Button,Menu,MenuItem } from "@mui/material";

// // material icon
// import TuneIcon from '@mui/icons-material/Tune';

// // sell item data
// // import { SellItemData } from "./SellItemData";

// // api url
// import { apiUrl } from "../../Private";
// import { USER_API_ENDPOINTS } from "../../utils/apis";

// const MarketPlace = () => {
//   const [pincodeData, setPincodeData] = useState();
//   const [isOpen, setIsOpen] = useState(true);
//   const [modalPincode, setModalPincode] = useState("");
//   const [sellItemData, setSellItemData] = useState([]);
//   const [dealerContactData, setDealerContactData] = useState([]);

//   const apiKey = localStorage.getItem("KTMauth");
//   const gAuth = localStorage.getItem("KTMgauth");
//   const sellItemName = localStorage.getItem("KTMsellItemName");
//   const pincode = localStorage.getItem("KTMpincode");
//   // const pincode = localStorage.getItem(apiKey['pincode']);

//   // scroll to top
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // open modal
//   const openModal = () => {
//     setIsOpen(!isOpen);
//   };

//   // change pincode
//   const changePincode = () => {
//     if (modalPincode !== "") {
//       axios
//         .get(`https://api.postalpincode.in/pincode/${modalPincode}`)
//         .then((res) => {
//           if (res.data[0].Status === "Success") {
//             localStorage.setItem("KTMpincode", modalPincode);
//             setModalPincode("");
//             setIsOpen(!isOpen);
//           } else {
//             setModalPincode("");
//             setIsOpen(!isOpen);
//             Swal.fire({
//               title: "Invalid pincode",
//               confirmButtonColor: "#56b124",
//             });
//           }
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//   };

//   //get subcategory sell item data
//   useEffect(() => {
//     axios.get(USER_API_ENDPOINTS.GET_SUB_CATEGORY_DEALER_DETAILS + `${pincode}/`)
//     .then((res) =>{
//       console.log(res.data);
//       setSellItemData(res.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       if(err.response.status === 302)
//       setSellItemData(err.response.data);
//     })
//   },[])

//   // get pincode data
//   useEffect(() => {
//     axios
//       .get(`https://api.postalpincode.in/pincode/${pincode}`)
//       .then((res) => {
//         setPincodeData(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, [pincode]);

//   // render selected sell items
//   // useEffect(() => {
//   //   if (sellItemName !== "all") {
//   //     const selectedItem = SellItemData.filter((eachItem) => {
//   //       return eachItem.category.toLowerCase() === sellItemName;
//   //     });
//   //     setSellItemData(selectedItem);
//   //   } else {
//   //     setSellItemData(SellItemData);
//   //   }
//   // }, [sellItemName]);

//   // get dealer contact data
//   useEffect(() => {
//     axios
//       // .get(`${apiUrl}/v3/dealer/api/getdealers/?search=${pincode}`)
//       .get(USER_API_ENDPOINTS.GET_DEALERS_VIA_PINCODE +  `${pincode}`)
//       .then((res) => {
//         if (res.status === 200) {
//           console.log(res.data.data['dealers'])
//           setDealerContactData(res.data.data['dealers']);
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, [pincode, sellItemName]);

//   // ---------- filter menu state & function and filter items ----------
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const filter = (category) => {
//     localStorage.setItem("KTMsellItemName", category.toLowerCase());
//     setAnchorEl(null);
//   };
//   // -------------------------------------------------------------------

//   return (
//     <>
//       <Navbar />

//       {apiKey !== null || gAuth !== null ? <UserProfileSearchbar /> : null}

//       <div className="sell__item__section">
//         <div className="sell__item__header">
//           {(() => {
//             if (sellItemData.length !== 1) {
//               return (
//                 <h1>
//                   {sellItemName[0].toUpperCase() +
//                     sellItemName.slice(1).toLowerCase()}{" "}
//                   Category
//                 </h1>
//               );
//             } else if (dealerContactData.length !== 0) {
//               return <h1>Dealer Contact Details</h1>;
//             } else {
//               return <h1>No Service</h1>;
//             }
//           })()}

//           <ChangePincode openModal={openModal} pincode={pincode} />

//           {pincodeData !== undefined ? (
//             <div className="sell__item__area">
//               <p>
//                 Selected area :{" "}
//                 <span>
//                   {pincodeData[0].PostOffice[0].Block},{" "}
//                   {pincodeData[0].PostOffice[0].District},{" "}
//                   {pincodeData[0].PostOffice[0].State} -{" "}
//                   {pincodeData[0].PostOffice[0].Pincode}
//                 </span>
//               </p>
//             </div>
//           ) : null}

//           {sellItemData.length !== 0 ? (
//             <div className="filter">
//               <Button
//                 aria-controls="simple-menu"
//                 aria-haspopup="true"
//                 onClick={handleClick}
//               >
//                 Filter
//                 <TuneIcon />
//               </Button>
//               <Menu
//                 id="simple-menu"
//                 anchorEl={anchorEl}
//                 open={Boolean(anchorEl)}
//               >
//                 <MenuItem onClick={filter.bind(this, "all")}>All</MenuItem>
//                 <MenuItem onClick={filter.bind(this, "paper")}>Paper</MenuItem>
//                 <MenuItem onClick={filter.bind(this, "glass")}>Glass</MenuItem>
//                 <MenuItem onClick={filter.bind(this, "plastic")}>
//                   Plastic
//                 </MenuItem>
//                 <MenuItem onClick={filter.bind(this, "metal")}>Metal</MenuItem>
//                 <MenuItem onClick={filter.bind(this, "e-waste")}>
//                   E-waste
//                 </MenuItem>
//                 <MenuItem onClick={filter.bind(this, "other")}>Other</MenuItem>
//               </Menu>
//             </div>
//           ) : null}
//         </div>

//         {(() => {
//           if (sellItemData.length !== 1) {
//             return (
//               <div className="sell__item">
//                 {sellItemData.map((eachItem, eachItemIndex) => {
//                   if(eachItem.price > 0)
//                   return (
//                     <MarketPlaceCard
//                       key={eachItemIndex}
//                       img={eachItem.subcategory_img}
//                       name={eachItem.subcategory_name}
//                       price={eachItem.price}
//                     />
//                   );
//                 })}
//               </div>
//             );
//           } else if (dealerContactData.length !== 0) {
//             return (
//               <div className="dealer__contact__section">
//                 {dealerContactData.map((eachItem) => {
//                   return (
//                     <DealerContactCard
//                     key={eachItem.id}
//                     dealerId={eachItem.id}
//                     Name={eachItem.name}
//                     Contact={eachItem.mobile}
//                     Dealing={eachItem.dealing_in}
//                     Minimum={eachItem.min_qty}
//                     Maximum={eachItem.qty}
//                     />
//                   );
//                 })}
//               </div>
//             );
//           } else {
//             return (
//               <p className="no__service">
//                 This service is not available in your area.
//                 <br />
//                 <span
//                   style={{
//                     color: "#56b124",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   It will be coming soon.
//                 </span>
//               </p>
//             );
//           }
//         })()}

//         <Modal
//           className="modal__content"
//           overlayClassName="modal__overlay"
//           isOpen={isOpen}
//           ariaHideApp={false}
//         >
//           <h1>Change area pincode</h1>
//           <input
//             type="text"
//             placeholder="Pincode"
//             value={modalPincode}
//             onChange={(e) => {
//               setModalPincode(e.target.value);
//             }}
//           />
//           <div>
//             <button onClick={changePincode}>Done</button>
//           </div>
//         </Modal>
//       </div>

//       <MainFooter />

//       <TermFooter />
//     </>
//   );
// };

// export default MarketPlace;
