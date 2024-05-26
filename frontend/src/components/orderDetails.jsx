import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  orderDetails,
  itemNo,
  prepaidReq,
  from,
  to,
  scanningProduct,
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
  const [scanningProductV, setscanningProduct] = useRecoilState(scanningProduct);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const dataFetch = async () => {
      const prepaid = localStorage.getItem("isPrepaid");
      const fromL = localStorage.getItem("from");
      const toL = localStorage.getItem("to");
      console.log(prepaid, "local prepaid")
      try {
        const response = await axios.post(
          `${API_URL}/api/v1/order/order`,
          { isPrepaid: prepaid, from: fromL || 0, to: toL || 99999999 },
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
          setscanningProduct(true)
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
      }
    };

    dataFetch();
  }, [isprepaid, fromValue, toValue, navigate]);

  return (
    <div className="flex justify-around my-2">
      <p className="text-3xl">{orderDetailsData.orderId}</p>
      <p className="text-l">{orderDetailsData.paymentStatus === "Cash on Delivery (COD)" ? "COD" : orderDetailsData.paymentStatus}</p>
      <p className="text-xl">
        {prodNo.completed}/{prodNo.total}
      </p>
    </div>
  );
};

export default OrderDetails;
