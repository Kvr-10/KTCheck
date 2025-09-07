import React, { useEffect, useState } from "react";

// css
import "../../Css/Cart.css";

// redux
import axios from "axios";
import { USER_API_ENDPOINTS } from "../../utils/apis";

const CartView = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderSummary, setOrderSummary] = useState([]);

  // Retrieve order_id and customer_id from localStorage
  const orders = JSON.parse(localStorage.getItem("order_details_responses")) || [];
  const customerId = JSON.parse(localStorage.getItem("KTMauth"))?.customer_id;

  useEffect(() => {
    const fetchAllOrderDetails = async () => {
      try {
        if (!orders.length || !customerId) {
          console.error("❌ Orders or Customer ID not found in localStorage");
          return;
        }

        let allOrderDetails = [];
        let allOrderSummaries = [];

        // Fetch details for each order
        for (const order of orders) {
          try {
            const response = await axios.get(`${USER_API_ENDPOINTS.GET_ORDER_DETAILS}${customerId}/${order.order_id}`);
            
            console.log(`✅ Order details fetched for order ${order.order_id}:`, response.data);
            
            const items = response.data.slice(0, -1); // All except the last object (summary)
            const summary = response.data[response.data.length - 1]; // Last object = summary
            
            // Add order_id to each item for identification
            const itemsWithOrderId = items.map(item => ({
              ...item,
              order_id: order.order_id,
              order_number: order.order_number
            }));
            
            allOrderDetails = [...allOrderDetails, ...itemsWithOrderId];
            allOrderSummaries.push({
              ...summary,
              order_id: order.order_id
            });
            
          } catch (error) {
            console.error(`❌ Error fetching details for order ${order.order_id}:`, error.response || error);
          }
        }

        setOrderDetails(allOrderDetails);
        setOrderSummary(allOrderSummaries);
        
        // Save the combined response to localStorage
        localStorage.setItem('order_details_full_response', JSON.stringify({
          items: allOrderDetails,
          summaries: allOrderSummaries
        }));
        
      } catch (error) {
        console.error("❌ Error fetching order details:", error.response || error);
      }
    };

    fetchAllOrderDetails();
  }, [customerId]);

  return (
    <>
      <div style={{ padding: '20px 0' }}>
        {/* <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Order Details</h2> */}
        
        {/* Create separate table for each order */}
        {orderSummary.map((summary, summaryIndex) => {
          // Filter items for this specific order
          const orderItems = orderDetails.filter(item => item.order_id === summary.order_id);
          
          return (
            <div key={summaryIndex} style={{ marginBottom: '40px' }}>
              {/* Order Header */}
              <h3 style={{ 
                color: '#56b124', 
                marginBottom: '15px', 
                textAlign: 'center',
                fontSize: '1.5rem'
              }}>
                Order #{summary.order_number}
              </h3>
              
              {/* Order Items Table */}
              <div className="cart__table" style={{ marginBottom: '20px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>S.NO</th>
                      <th>Scrap Name</th>
                      <th>Unit</th>
                      <th>Quantity</th>
                      <th>Price (Rs)</th>
                      <th>Subtotal (Rs)</th>
                      <th>Taxes (Rs)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.subcategory_name}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                        <td>{item.subtotal}</td>
                        <td>{item.taxes}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                    {/* Order total row for this specific order */}
                    <tr className="grand-total-row">
                      <td colSpan="7" className="grand-total-label">
                        Order Total
                      </td>
                      <td className="grand-total-value">
                        {summary.order_total} Rs
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CartView;