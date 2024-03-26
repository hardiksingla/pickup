import { useRecoilValue,useRecoilState } from "recoil";
import { itemNo,orderDetails } from "../store/atoms/barcode";
import axios from 'axios';
import { API_URL } from "../config";

const Buttons = () => {
    const totalItems = useRecoilValue(itemNo).total;
    const completedItems = useRecoilValue(itemNo).completed;
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const orderId = orderDetailsData.orderId;
    
    const dataFetch = async () => {
        console.log('dataFetch');
        const response = await axios.get(`${API_URL}/api/v1/order/order`);
        console.log(response.data);                
        if(response.data.messageStatus == 0){
            console.log("sfefsf:,",response.data.messageStatus)
            setOrderDetailsData({orderId : "No Order",paymentStatus : "No Order",products : []})
          }else{
                for (const product of response.data.products){
                    product.completionStatus = 0;
                }
                setOrderDetailsData(response.data);
          }
    }

    const skip = async (e) => {
        e.preventDefault();
        console.log(API_URL);
        console.log(orderId);
        const respone = await axios({method : 'post', url : "http://localhost:3000/api/v1/order/submit",data: {
            orderId : orderId,
            status : 'skipped'
        }})

        if (respone.data.status == 1){
            
            dataFetch()
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (totalItems === completedItems) {
            console.log('submit');
            const endpoint = API_URL+"/api/v1/order/submit"
            console.log(endpoint);
            
            const respone = await axios.post(endpoint , {
                orderId : orderId,
                status : 'completed'
            })
            console.log(respone);
            if (respone.data.status == 1){            
                dataFetch()
            }
        }
    };

    return (
        <div className="flex justify-around my-5">
            <button onClick={skip}>Skip</button>
            <button onClick={submit}>Submit</button>
        </div>
    );
};

export default Buttons;
