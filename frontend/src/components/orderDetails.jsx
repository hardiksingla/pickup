import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Loader from "react-js-loader";
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
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  
    const dataFetch = async () => {
      const orderType = localStorage.getItem("selectedOption");
      const fromL = localStorage.getItem("from");
      const toL = localStorage.getItem("to");
  
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${API_URL}/api/v1/order/order`,
          {
            orderType,
            from: fromL || 0,
            to: toL || 99999999,
            yesterday: localStorage.getItem('yesterdayCheck')
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.data.messageStatus === 0) {
          setOrderDetailsData({
            orderId: "No Order",
            paymentStatus: "No Order",
            products: [],
          });
        } else {
          setOrderDetailsData(response.data);
          setscanningProduct(true);
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    dataFetch();
  }, []);
  

  return (
    <div>
        {
            isLoading ?
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-bgDefault z-50">
                <Loader type="spinner-cub" bgColor="white" size={100} />   
            </div>: 

        <div className="flex justify-around my-2">
          <p className="text-3xl">{orderDetailsData.orderId}</p>
          <p className="text-l">{orderDetailsData.paymentStatus === "Cash on Delivery (COD)" ? "COD" : orderDetailsData.paymentStatus}</p>
          <p className="text-xl">
            {prodNo.completed}/{prodNo.total}
          </p>
          {
            orderDetailsData.skipReason !=  null  &&
            <p>{orderDetailsData.skipReason}</p>
          }
        </div>

      }
  </div>


  );
};

export default OrderDetails;
