import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  orderDetails,
  itemNo,
  prepaidReq,
  from,
  to,
} from "../store/atoms/barcode";
import { API_URL } from "../config.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderDetails = () => {
  const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
  const prodNo = useRecoilValue(itemNo);
  const isprepaid = useRecoilValue(prepaidReq);
  const [fromValue, setFrom] = useRecoilState(from);
  const [toValue, setTo] = useRecoilState(to);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return; // Prevent further execution
    }

    const dataFetch = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/v1/order/order`,
          { isPrepaid: isprepaid, from: fromValue || 0, to: toValue || 99999999 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.messageStatus === 0) {
          setOrderDetailsData({
            orderId: "No Order",
            paymentStatus: "No Order",
            products: [],
          });
        } else {
          response.data.products.forEach(product => {
            product.completionStatus = 0;
          });
          setOrderDetailsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
        // Handle error appropriately
      }
    };

    dataFetch();
  }, [isprepaid, fromValue, toValue, navigate]); // Ensure effect runs on dependency changes

  return (
    <div className="flex justify-around my-2">
      <p className="text-2xl">{orderDetailsData.orderId}</p>
      <p className="text-2xl">{orderDetailsData.paymentStatus === "Cash on Delivery (COD)" ? "COD" : orderDetailsData.paymentStatus}</p>
      <p className="text-2xl">
        {prodNo.completed}/{prodNo.total}
      </p>
    </div>
  );
};

export default OrderDetails;
