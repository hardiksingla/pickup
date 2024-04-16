import { useRecoilValue,useRecoilState } from "recoil";
import { bagId, itemNo,orderDetails,prepaidReq, from,to , scanningProduct} from "../store/atoms/barcode";
import axios from 'axios';
import { API_URL } from "../config";

const Buttons = () => {
    const totalItems = useRecoilValue(itemNo).total;
    const completedItems = useRecoilValue(itemNo).completed;
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const orderId = orderDetailsData.orderId;
    const [bagIdValue , setBagValue] = useRecoilState(bagId);
    const isprepaid = useRecoilValue(prepaidReq);
    const fromValue = useRecoilValue(from);
    const toValue = useRecoilValue(to);
    const [scanningProducts, setScanningProduct] = useRecoilState(scanningProduct);
    

    const reset = () => {
        setBagValue('');
        setScanningProduct(false)
    }

    const dataFetch = async () => {
        console.log('dataFetch');
        const token = localStorage.getItem("token");
        console.log(token);
        const response = await axios.post(`${API_URL}/api/v1/order/order` , {isPrepaid: isprepaid, from: fromValue || 0, to: toValue || 99999999 },{headers: { Authorization: `Bearer ${token}` }});
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
            reset()
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
                status : 'completed',
                bagId : bagIdValue
            })
            console.log(respone);
            if (respone.data.status == 1){            
                reset ()
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
