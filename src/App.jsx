import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";

// CSS
import './App.css';

// Private routes
import PrivateCustomerRoute from './Route/PrivateCustomerRoute';
import PrivateDealerRoute from './Route/PrivateDealerRoute';
import PrivateSellItemRoute from './Route/PrivateSellItemRoute';
import PrivateAuthRoute from './Route/PrivateAuthRoute';
import PrivateAdminRoute from './Route/PrivateAdminRoute';

// Common Pages
import About from "./Component/AboutPage/About";
import HomePage from './Component/HomePage/HomePage';
import JoinUs from './Component/JoinUsPage/JoinUs';
import Sell from './Component/SellPage/Sell';
import Faq from './Component/FaqPage/Faq';
import Contact from "./Component/ContactPage/Contact";
import PrivacyPolicy from './Component/PrivacyTerms/PrivacyPolicy';
import TermsConditions from './Component/PrivacyTerms/TermsConditions';
import Donation from './Component/HomePage/Donation';
import WasteDonation from './Component/HomePage/WasteDonation';

// News
import NewsArticle from './Component/HomePage/NewsArticle';

// Auth
import SignIn from './Component/SignIn/SignIn';
import SignUp from './Component/SignUp/Register';
import CustomerSignUp from './Component/SignUp/CustomerSignUp/CustomerSignUp';
import CustomerSignUpPersonal from './Component/SignUp/CustomerSignUp/CustomerSignUpPersonal/CustomerSignUpPersonal';
import CustomerSignUpOrganization from './Component/SignUp/CustomerSignUp/CustomerSignUpOrganization/CustomerSignUpOrganization';
import DealerSignUp from './Component/SignUp/DealerSignUp/DealerSignUp';
import Verification from './Component/SignUp/Verification';
import ForgotPassword from './Component/ForgotPassword/ForgotPassword';
import ForgetLinkStep1 from './Component/ForgotPassword/ForgetLinkStep1';
import ForgetLinkStep2 from './Component/ForgotPassword/ForgetLinkStep2';
import Extra from './Component/ForgotPassword/Extra';

// Sell Item
import SellItem from './Component/SellItemPage/SellItem';

// Customer Pages
import CartSection from './Component/Cart/CartSection';
import UserProfile from './Component/User/UserProfile/UserProfile';
import UserProfileEdit from './Component/User/UserProfile/UserProfileEdit';
import UserAddress from './Component/User/UserProfile/UserAddress';
import UserPickup from './Component/User/UserPickup/UserPickup';
import UserQR from './Component/User/UserQR/UserQR';
import UserAutoScrap from './Component/User/UserAutoScrap/UserAutoScrap';
import UserWallet from './Component/User/UserWallet/UserWallet';
import UserWalletHistory from './Component/User/UserWallet/UserWalletHistory';

// Dealer Pages
import DealerHome from './Component/Dealer/DealerHome/DealerHome';
import DealerProfile from './Component/Dealer/DealerProfile/DealerProfile';
import DealerProfileEdit from './Component/Dealer/DealerProfile/DealerProfileEdit';
import DealerQR from './Component/Dealer/DealerQR/DealerQR';
import DealerPickup from './Component/Dealer/DealerPickup/DealerPickup';
import DealerMarketplace from './Component/Dealer/DealerMarketplace/DealerMarketplace';
import DealerWallet from './Component/Dealer/DealerWallet/DealerWallet';
import DealerSettings from './Component/Dealer/DealerSettings/DealerSettings';
import DealerDocumentUpload from './Component/Dealer/DealerSettings/DealerDocumentUpload/DealerDocumentUpload';
import DealerArea from './Component/Dealer/DealerSettings/DealerArea/DealerArea';
import DealerSetPrice from './Component/Dealer/DealerSettings/DealerSetPrice/DealerSetPrice';
import DealerEditPrice from './Component/Dealer/DealerSettings/DealerSetPrice/DealerEditPrice';
import DealerPriceList from './Component/Dealer/DealerSettings/DealerSetPrice/DealerPriceList';
import DealerRequestCategory from './Component/Dealer/DealerSettings/DealerRequestCategory/DealerRequestCategory';
import DealerAddEmployee from './Component/Dealer/DealerSettings/DealerAddEmployee';
import DealerAddress from './Component/Dealer/DealerProfile/DealerAddress';
import BillPage from './Component/Dealer/DealerBill/BillPage';

// Admin Pages
import AdminDashboard from './Component/Admin/AdminDashboard';
import AdminDealerManagement from './Component/Admin/AdminDealerManagement';
import AdminOTPVerification from './Component/Admin/AdminOTPVerification';

// MarketPlace
import MarketPlaceNew from './Component/MarketPlace/MarketPlaceNew';

// Others
import Address from './Component/Address';
import Demo from './Component/Dealer/Demo';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePassword from './Component/User/UserProfile/ChangePassword';

const App = () => {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Switch>

        {/* Public Routes */}
        <Route exact path="/" component={HomePage} />
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/about" component={About} />
        <Route exact path="/joinus" component={JoinUs} />
        <Route exact path="/sell" component={Sell} />
        <Route exact path="/faq" component={Faq} />
        <Route exact path="/contact" component={Contact} />
        <Route exact path="/privacypolicy" component={PrivacyPolicy} />
        <Route exact path="/termsconditions" component={TermsConditions} />
        <Route exact path="/donation" component={Donation} />
        <Route exact path="/wastedonation" component={WasteDonation} />
        <Route exact path="/address" component={Address} />
        <Route exact path="/sell/sellitem" component={SellItem} />
        <Route exact path="/home/news/:id" component={NewsArticle} />

        {/* Auth Routes */}
        <PrivateAuthRoute exact path='/signin/signup' component={SignUp} />
        <PrivateAuthRoute exact path='/signin/signup/customer' component={CustomerSignUp} />
        <PrivateAuthRoute exact path='/signin/signup/customer/personal' component={CustomerSignUpPersonal} />
        <PrivateAuthRoute path='/signin/signup/customer/organization' component={CustomerSignUpOrganization} />
        <PrivateAuthRoute exact path='/signin/signup/dealer' component={DealerSignUp} />
        <PrivateAuthRoute path="/signin" component={SignIn} />

        {/* Verification & Password Reset */}
        <Route exact path='/email-verify/:code/:activationId' component={Verification} />
        <Route exact path="/forget_password" component={ForgotPassword} />
        <Route exact path="/reset-password/:code/:resetId" component={ForgetLinkStep1} />
        <Route exact path="/password_change_success" component={ForgetLinkStep2} />
        
        {/* <Route exact path="/v3/api/password-reset-confirm/:utype/:uid/:token/Frontend" component={Extra} /> */}

        {/* Customer Protected Routes */}

        <PrivateCustomerRoute exact path="/sell/user/profile" component={UserProfile} />

        <PrivateCustomerRoute exact path='/sell/cart' component={CartSection} />
        <PrivateCustomerRoute exact path='/sell/user/profile' component={UserProfile} />
        <PrivateCustomerRoute exact path='/sell/user/address' component={UserAddress} />
        <PrivateCustomerRoute exact path='/sell/user/profile/profileedit' component={UserProfileEdit} />
        <PrivateCustomerRoute exact path='/sell/user/pickup' component={UserPickup} />
        <PrivateCustomerRoute exact path='/sell/user/qr' component={UserQR} />
        <PrivateCustomerRoute exact path='/sell/user/autoscrap' component={UserAutoScrap} />
        <PrivateCustomerRoute exact path='/sell/user/wallet' component={UserWallet} />
        <PrivateCustomerRoute exact path='/sell/user/wallet/wallethistory' component={UserWalletHistory} />
        <PrivateCustomerRoute exact path='/sell/user/change-password' component={ChangePassword} />

        {/* Dealer Protected Routes */}
        <PrivateDealerRoute exact path={"/dealer/home"} component={DealerHome} />
        <PrivateDealerRoute exact path={"/dealer/address"} component={DealerAddress} />
        <PrivateDealerRoute exact path='/dealer/profile' component={DealerProfile} />
        <PrivateDealerRoute exact path='/dealer/profile/profileedit' component={DealerProfileEdit} />
        <PrivateDealerRoute exact path='/dealer/profile/qr' component={DealerQR} />
        <PrivateDealerRoute exact path='/dealer/pickup' component={DealerPickup} />
        <PrivateDealerRoute exact path='/dealer/marketplace' component={DealerMarketplace} />
        <PrivateDealerRoute exact path='/dealer/wallet' component={DealerWallet} />
        <PrivateDealerRoute exact path='/dealer/settings' component={DealerSettings} />
        <PrivateDealerRoute exact path='/dealer/settings/addarea' component={DealerArea} />
        <PrivateDealerRoute exact path='/dealer/settings/setprice' component={DealerSetPrice} />
        <PrivateDealerRoute exact path='/dealer/settings/setprice/editprice' component={DealerEditPrice} />
        <PrivateDealerRoute exact path='/dealer/settings/setprice/editprice/pricelist' component={DealerPriceList} />
        <PrivateDealerRoute exact path='/dealer/settings/documentupload' component={DealerDocumentUpload} />
        <PrivateDealerRoute exact path='/dealer/settings/requestcategory' component={DealerRequestCategory} />
        <PrivateDealerRoute exact path='/dealer/settings/addemployee' component={DealerAddEmployee} />
        <PrivateDealerRoute exact path='/dealer/bill' component={BillPage} />
        
        {/* Admin Protected Routes */}
        <Route exact path='/admin/otp-verification' component={AdminOTPVerification} />
        <PrivateAdminRoute exact path='/admin/dashboard' component={AdminDashboard} />
        <PrivateAdminRoute exact path='/admin/dealers' component={AdminDealerManagement} />

        {/* MarketPlace */}
        <Route exact path='/marketplace/:num/' component={MarketPlaceNew} />

        {/* Catch-all redirect */}
        <Redirect to="/" />

      </Switch>
    </Router>
  );
};

export default App;
