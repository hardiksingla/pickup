import { useRecoilValue,useRecoilState } from "recoil";
import { bagId, itemNo,orderDetails,prepaidReq, from,to , scanningProduct , bagIdReq} from "../store/atoms/barcode";
import axios from 'axios';
import { API_URL } from "../config";
import { useEffect, useState } from "react";

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
    const [isOpen, setIsOpen] = useState(false);
    const [isSkipOpen, setIsSkipOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [bagIdReqValue , setBagIdReqValue] = useRecoilState(bagIdReq);

    const reset = () => {
        if(bagIdReqValue){
            setBagValue('');
            setScanningProduct(false)
        }
        
    }

    useEffect(() => {   
       if (!bagIdReqValue){
        console.log('reset');
        setScanningProduct(true)
       }else{
        setScanningProduct(false)
       }
    }, [bagIdReqValue]);

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
        setIsSkipOpen(true);
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
        }else{
            // alert('Please complete all items')
            setIsOpen(true)
        }
    };
    const togglePopup = () => {
        setIsOpen(!isOpen);
      };
    // const toggleSkipPopup = () => {
    //     setIsSkipOpen(!isOpen);
    // };

    const handleSubmit = async () => {
        // alert(`You selected: ${selectedAnswer}`);
        setIsSkipOpen(false);
        console.log(API_URL);
        console.log(orderId);
        const respone = await axios({method : 'post', url : `${API_URL}/api/v1/order/submit`,data: {
            orderId : orderId,
            status : 'skipped',
            comment : selectedAnswer,
            bagId : bagIdValue
        }})

        if (respone.data.status == 1){
            reset()
            dataFetch()
        }
    };
    const handleAnswerChange = (event) => {
        setSelectedAnswer(event.target.value);
      };

    return (
        <>

        {isSkipOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4 text-white2">Choose an Option</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <label className="block mb- text-white2">
                        <input
                        type="radio"
                        value="Item missing"
                        checked={selectedAnswer === 'Item missing'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Item missing
                    </label>
                    <label className="block mb-2 text-white2">
                        <input
                        type="radio"
                        value="Cancelled manually"
                        checked={selectedAnswer === 'Cancelled manually'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Cancelled manually
                    </label>
                    <label className="block mb-2 text-white2">
                        <input
                        type="radio"
                        value="Already packed"
                        checked={selectedAnswer === 'Already packed'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Already packed
                    </label>
                    <button
                        type="submit"
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-white2"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-white2"
                        onClick={() => setIsSkipOpen(false)}
                    >
                        Cancel
                    </button>
                    </form>
                </div>
                </div>
            )}

        {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2 text-white2">Can Not Submit</h2>
                    <p className="text-gray-700 mb-4 text-white2">All the Items Have Not Been Picked Yet</p>
                    <button 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                    onClick={togglePopup}
                    >
                    Close
                    </button>
                </div>
                </div>
            )}
        <div className="flex justify-around my-5">
            <button onClick={skip}>Skip</button>
            <button onClick={submit}>Submit</button>
        </div>
        </>
    );
};

export default Buttons;
