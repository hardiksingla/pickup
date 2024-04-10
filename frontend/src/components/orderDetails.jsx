import { useEffect,useState } from "react";
import {useRecoilState , useRecoilValue} from "recoil";
import {orderDetails , itemNo ,prepaidReq} from "../store/atoms/barcode";
import { API_URL } from "../config.js";
import axios, { formToJSON } from "axios";

const OrderDetails = () => {
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const prodNo = useRecoilValue(itemNo)
    const isprepaid = useRecoilValue(prepaidReq);
    useEffect(() => {
      const dataFetch = async () => {
        console.log(isprepaid);
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/api/v1/order/order` , {isPrepaid : isprepaid },{headers: { Authorization: `Bearer ${token}` }});
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
