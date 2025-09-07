// export const apiUrl1 = "https://apis.kabaditechno.com"
// export const apiUrl = "https://apis.kabaditechno.com/"

// export const apiUrl1 = "http://localhost:8000"
// export const apiUrl = "http://localhost:8000/"

export const apiUrl1 = "https://cornwall-files-sierra-forgotten.trycloudflare.com"
export const apiUrl = "https://cornwall-files-sierra-forgotten.trycloudflare.com/"

// export const apiUrl1 = "https://demo.kabaditechno.com"
// export const apiUrl = "https://demo.kabaditechno.com/"

export const USER_API_ENDPOINTS = {
    LOGIN_API : `${apiUrl1}/accounts/login/`, 
    SIGNUP_API : `${apiUrl1}/accounts/register/`, 
    ACTIVATE_API: `${apiUrl1}/accounts/activate/`, 
    RESET_PASSWORD_GENERATION : `${apiUrl1}/accounts/password-reset/`,
    RESET_PASSWORD : `${apiUrl1}/accounts/reset-password`,
    REFRESH_TOKEN : `${apiUrl1}/accounts/token/refresh/`,
    CHANGE_PASSWORD: `${apiUrl1}/accounts/change-pass/`,
    GET_CUSTOMER_PROFILE : `${apiUrl1}/accounts/customer-profile/`, 
    UPDATE_CUSTOMER_PROFILE : `${apiUrl1}/accounts/customer-profile/`, 
    LOGOUT : `${apiUrl1}/accounts/logout/`,
    GET_ADDRESS : `${apiUrl1}/accounts/address/`,
    UPDATE_ADDRESS : `${apiUrl1}/accounts/address/`,
    DELETE_ADDRESS : `${apiUrl1}/accounts/address/`,
    GET_CATEGORY : `${apiUrl1}/Category/category-list/`, //tested
    GET_SUB_CATEGORY_DEALER_DETAILS : `${apiUrl1}/dealer_details/search-subcategory`, //tested
    GET_DEALERS_VIA_PINCODE: `${apiUrl1}/dealer/api/getdealers/`, 
    GET_HAPPY_CUSTOMERS: `${apiUrl1}/WebsiteContent/happy-customers/`, //tested
    GET_TEAM_MEMBERS: `${apiUrl1}/WebsiteContent/team-members/`, //tested
    GET_VOTES: `${apiUrl1}/voting_system/get-votes/`, //tested
    ADD_VOTE: `${apiUrl1}/voting_system/post-votes/`,  //tested
    SUGGESTION_FORM:`${apiUrl1}/WebsiteContent/suggestion-form/`, //tested
    GET_FAQ_QUESTIONS: `${apiUrl1}/WebsiteContent/faq/`,  //tested
    SEND_QUERY_VIA_CONTACT_FORM: `${apiUrl1}/WebsiteContent/contact-form/`, //tested
    INVESTOR_FORM: `${apiUrl1}/WebsiteContent/investor-form/`, //tested
    MENTOR_FORM: `${apiUrl1}/WebsiteContent/mentor-form/`, //tested
    INTERN_FORM: `${apiUrl1}/WebsiteContent/intern-form/`, //tested
    WORKING_TEAM_MEMBERS: `${apiUrl1}/WebsiteContent/working-team-members/`,
   
    GET_MARKETPLACE_BY_KTID: `${apiUrl1}/marketplace/get-marketplace/`,
   
    DISPLAY_ALL_DEALERS: `${apiUrl1}/dealer/api/dealerlist/`,
    GET_DEALER_BY_USERID: `${apiUrl1}/dealer/api/getdealers/`, 


    ADD_PINCODES_DEALER_DETAILS: `${apiUrl1}/dealer_details/add_pincodes/`,
    UPDATE_PINCODES_DEALER_DETAILS: `${apiUrl1}/dealer_details/update_pincodes/`,
    GET_NUMBER_OF_PINCODES_DEALER_DETAILS: `${apiUrl1}/dealer_details/no_of_pincodes/`, 
    GET_DEALER_ALL_PINCODES: `${apiUrl1}/dealer_details/get_all_pincodes/`,
    DELETE_PRICE_DEALER_DETAILS: `${apiUrl1}/dealer_details/delete-price/`,   // SAME used to delete pincodes
    REQ_TO_ADD_PINCODES_DEALER_DETAILS: `${apiUrl1}/dealer_details/request_to_add_pincodes/`, //tested
    

    // WITH TOKEN
    GET_DEALER_PROFILE : `${apiUrl1}/accounts/dealer-profile/`,
    DEALER_KABADI_ADD_DOCUMENTS : `${apiUrl1}/dealer_details/add_documents/`, //tested
    DEALER_KABADI_FETCH_DOCUMENTS : `${apiUrl1}/dealer_details/get_documents/`, //tested
    // DIRECT (DEALER DETAILS)...
    GET_DEALER_DETAILS_PROFILE : `${apiUrl1}/dealer/api/getdealers/`, //tested
    // not working
   

    GET_DEALER_DETAILS_PRICE: `${apiUrl1}/dealer_details/get-price/`, 
   
    ADD_PRICE_DEALER_DETAILS: `${apiUrl1}/dealer_details/add-price/`, 
    UPDATE_PRICE_DEALER_DETAILS: `${apiUrl1}/dealer_details/update-price/`, 
    
    // working
    GET_CATEGORY_REQUESTS_DEALER_DETAILS: `${apiUrl1}/dealer_details/get_category_request/`,//tested
    ADD_CATEGORY_REQUESTS_DEALER_DETAILS: `${apiUrl1}/dealer_details/add_category_request/`,//tested
    GET_ALL_SUB_CATEGORY_LIST: `${apiUrl1}/Category/all-subcategory-list/`, //tested
    GET_ALL_SUB_CATEGORY_LIST_BY_KEYWORD: `${apiUrl1}/Category/subcategory-list/`, //tested
    UPDATE_DEALER_PROFILE: `${apiUrl1}/accounts/dealer-profile/`, //tested 
    GET_QR : `${apiUrl1}/accounts/myqr/` ,//tested
    SCHEDULE_PICKUP_DEALER_MARKET_PLACE : `${apiUrl1}/dealer_marketplace/schedule_pickup/schedule_pickup/` ,
    VIEW_SCHEDULE_PICKUP_DEALER_MARKET_PLACE1 : `${apiUrl1}/dealer_marketplace/schedule_pickup/schedule_pickup/`,
    DEALER_RATING_DEALER_MARKET_PLACE : `${apiUrl1}/dealer_marketplace/dealer_rating/dealer_rating/` ,
    VIEW_DEALER_INITIATIVE_DEALER_MARKET_PLACE : `${apiUrl1}/dealer_marketplace/dealer_initiatives/dealer_initiatives/`, 
    REACH_US_INITIATIVE_DEALER_MARKET_PLACE : `${apiUrl1}/dealer_marketplace/reach_us/reach_us/`, 
    REQUEST_ENQUIRY_DEALER : `${apiUrl1}/dealer/api/requestinquiry-post/`,  //post


    // cart apis: 
    ADD_ITEM_CART : `${apiUrl1}/carts/add_item/`,
    ADD_ORDER_FOR_CART_ORDER_ID : `${apiUrl1}/carts/add_order/`,
    DELETE_ITEM_CART_BY_ID : `${apiUrl1}/carts/delete_cart_item/`,
    VIEW_CART: `${apiUrl1}/carts/viewCart/`,
    ADD_QUANTITY_ITEM_CART: `${apiUrl1}/carts/add_quantity/`,
    SUB_QUANTITY_ITEM_CART: `${apiUrl1}/carts/decrease_quantity/`,

    GET_DEALERS_VIA_EMAIL: `${apiUrl1}/dealer/api/requestinquiry-get/`,

    TAKE_ORDER_DETAILS: `${apiUrl1}/order/take-order-details/`,
    GET_ORDER_DETAILS: `${apiUrl1}/order/view-order-details/`,

    ORDER_INITIALIZATION: `${apiUrl1}/order/order-product-initialization/`,

    GET_DEALER_PICKUP_ORDER: `${apiUrl1}/order/get-all-orders-dealer/`,
    GET_CUSTOMER_PICKUP_ORDER: `${apiUrl1}/order/get-all-orders-customer/`,

    GET_ALL_ORDERS_OF_CUSTOMER_FOR_DEALER: `${apiUrl1}/order/get-all-orders-of-customer-for-dealer/`,

    CANCEL_ORDER_VIA_CUSTOMER: `${apiUrl1}/order/cancel-order-via-customer/`,
    CANCEL_ORDER_VIA_DEALER: `${apiUrl1}/order/cancel-order-via-dealer/`,
    ACCEPT_ORDER_VIA_DEALER: `${apiUrl1}/order/accepted-order-via-dealer/`,

    // Home Page APIs
    HOMEPAGE_CONTACT_FORM: `${apiUrl1}/homepage/contacts/`, //Yet to be tested
    HOMEPAGE_CONSULTATION_FORM: `${apiUrl1}/homepage/contacts/create/`,

    HOMEPAGE_DONATION_FORM: `${apiUrl1}/homepage/donate/`,

    HOMEPAGE_NEWS: `${apiUrl1}/homepage/api/news/`,
    HOMEPAGE_ADMIN_CREATE_NEWS: `${apiUrl1}/homepage/api/admin/news/`,
    HOMEPAGE_ADMIN_GET_ALL_NEWS: `${apiUrl1}/homepage/api/admin/news/`,
    HOMEPAGE_ADMIN_UPDATE_NEWS: `${apiUrl1}/homepage/api/admin/news/`,
    HOMEPAGE_ADMIN_DELETE_NEWS: `${apiUrl1}/homepage/api/admin/news/`,

    DEALER_SUBSCRIPTION: `${apiUrl1}/api/payment/subscription/`,
    DEALER_TRIAL_ELIGIBILITY: `${apiUrl1}/api/payment/trial/eligibility/`,
    CREATE_DEALER_MARKETPLACE: `${apiUrl1}/marketplace/create-marketplace/`,
    GET_DEALER_MARKETPLACE: `${apiUrl1}/marketplace/get-marketplace/`,

    GET_BANK_DETAILS: `${apiUrl1}/api/payment/bank-details/`,
    
    MARKETPLACE_PAYMENT: `${apiUrl1}/api/payment/submit-payment/`,

    GET_DEALER_SUBSCRIPTION: `${apiUrl1}/api/payment/subscription/`,

    GET_MARKETPLACE_PAYMENT_STATUS: `${apiUrl1}/api/payment/payment-status/`,

    // Admin APIs
    ADMIN_SEND_OTP: `${apiUrl1}/accounts/send-otp/`,
    REGENERATE_OTP_BY_CUSTOMER: `${apiUrl1}/order/regenerate-otp/`,
    ADMIN_VERIFY_OTP: `${apiUrl1}/accounts/verify-otp/`,
    ADMIN_DELETE_MARKETPLACE: `${apiUrl1}/marketplace/delete-marketplace/`,
    ADMIN_ADD_DEALER: `${apiUrl1}/dealer/api/dealeradd/`,
    ADMIN_VIEW_DEALER_DETAILS: `${apiUrl1}/api/payment/admin/dealers-subscriptions/`,
    ADMIN_VERIFY_PAYMENT: `${apiUrl1}/api/payment/verify-payment/`,
    ADMIN_VERIFY_COMMISSION_PAYMENT: `${apiUrl1}/invoice/verify-commission-payment/`,
    ADMIN_GET_ALL_COMMISSION_BILLS: `${apiUrl1}/invoice/get-all-payment-details/`,
    ADMIN_ACCOUNT_ACTIVATION: `${apiUrl1}/accounts/user-activation/?user_id=`,
    ADMIN_GET_ALL_CUSTOMERS_ACCOUNT: `${apiUrl1}/accounts/admin-user-list/`,
    ADMIN_GET_ALL_DEALERS_DETAILS: `${apiUrl1}/invoice/get-all-dealers-with-orders/`,

    // DIGIPIN

    GET_ENCODE: `${apiUrl1}/postalpin/encode-digipin/`,
    GET_DECODE: `${apiUrl1}/postalpin/decode-digipin/`,


    EMPLOYEE_REGISTRATION: `${apiUrl1}/employee/registration/employee/`,

    CUSTOMER_ORDER_INVOICE: `${apiUrl1}/invoice/dealer/`,
    GET_COMMISSION_ID_FOR_DEALER: `${apiUrl1}/invoice/api/commissions/dealer_summary/?dealer_id=`,
    COMMISSION_BILL_OF_DEALER: `${apiUrl1}/invoice/commission/`,
    COMMISSION_BILL_DOWNLOAD_OF_DEALER: `${apiUrl1}/invoice/commission/download/`,
    COMMISSION_PAYMENT_DETAILS: `${apiUrl1}/invoice/submit-commission-payment/`,


    UPDATE_ORDER_BY_DEALER: `${apiUrl1}/order/update-order/`,

    //Banner APIs
    PUBLIC_BANNER_LIST: `${apiUrl1}/api/banners/`,
    ADMIN_BANNER_LIST: `${apiUrl1}/api/admin/banners/`,
    ADMIN_CREATE_BANNER: `${apiUrl1}/api/admin/banners/`,
    ADMIN_UPDATE_BANNER: `${apiUrl1}/api/admin/banners/`, // + banner id at the end
    ADMIN_DELETE_BANNER: `${apiUrl1}/api/admin/banners/`, // + banner id at the end


        //Banner APIs
    PUBLIC_INTERNSHIP_BANNER_LIST: `${apiUrl1}/api/internship-banners/`,
    ADMIN_INTERNSHIP_BANNER_LIST: `${apiUrl1}/api/admin/internship-banners/`,
    ADMIN_INTERNSHIP_CREATE_BANNER: `${apiUrl1}/api/admin/internship-banners/`,
    ADMIN_INTERNSHIP_UPDATE_BANNER: `${apiUrl1}/api/admin/internship-banners/`, // + banner id at the end
    ADMIN_INTERNSHIP_DELETE_BANNER: `${apiUrl1}/api/admin/internship-banners/` // + banner id at the end

}
