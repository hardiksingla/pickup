import { useEffect,useState } from "react";
import {useRecoilState , useRecoilValue} from "recoil";
import {orderDetails , itemNo} from "../store/atoms/barcode";
import { API_URL } from "../config.js";
import axios from "axios";

const OrderDetails = () => {
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const prodNo = useRecoilValue(itemNo)
    useEffect(() => {
      const dataFetch = async () => {
        const response = await axios.get(`${API_URL}/api/v1/order/order`);
        console.log(response.data);                
        if(response.data.messageStatus == 0){
            setOrderDetailsData({orderId : "No Order",paymentStatus : "No Order",products : []})
          }else{
                for (const product of response.data.products){
                    product.completionStatus = 0;
                }
                setOrderDetailsData(response.data);
          }
    }
    dataFetch()
  }, []);
  return (
    <div className="flex justify-around my-2">
      <p>{orderDetailsData.orderId}</p>
      <p>{orderDetailsData.paymentStatus}</p>
      <p>{prodNo.completed}/{prodNo.total}</p>
    </div>
  );
};

export default OrderDetails;
