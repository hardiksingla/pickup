import { useRecoilState, useSetRecoilState } from "recoil";
import { prepaidReq, from, to ,bagIdReq } from "../store/atoms/barcode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API_URL } from "../config.js";
import { useState } from "react";


function Select() {
    const [isPrepaid, setPrepaid] = useRecoilState(prepaidReq);
    const navigate = useNavigate();
    const [fromValue, setFrom] = useRecoilState(from);
    const [toValue, setTo] = useRecoilState(to);
    const [isChecked, setIsChecked] = useRecoilState(bagIdReq);
    const [upadteLoading, setUpadteLoading] = useState(false)
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    
    // Function to validate and update the 'from' and 'to' values before proceeding
    const validateAndNavigate = (isPrepaidOption) => {
        // Parse the values to ensure they are treated as numbers
        let fromVal = parseInt(fromValue, 10);
        let toVal = parseInt(toValue, 10);

        // Check and set default for 'from' if not provided or invalid
        if (isNaN(fromVal)) {
            fromVal = 0;
            setFrom('0'); // Update the 'from' state with the default value
            localStorage.setItem('from', '0'); // Store the 'from' value in local storage
        }

        // Check and set default for 'to' if not provided or invalid
        if (isNaN(toVal) || toVal === 0) {
            toVal = 99999999;
            setTo('99999999'); // Update the 'to' state with the default value
            localStorage.setItem('to', '99999999'); // Store the 'to' value in local storage
        }
        if (toVal >= fromVal) {
            setPrepaid(isPrepaidOption); // Update the prepaid status based on the button clicked
            localStorage.setItem('isPrepaid', isPrepaidOption); // Store the prepaid status in local storage
            navigate('/home');
        } else {
            alert('The "to" value must be greater than the "from" value.');
        }
    };

    const handlePrepaidSelection = () => {
        validateAndNavigate(true);
    };

    const handlePostPaidSelection = () => {
        validateAndNavigate(false);
    };
    const handleAllSelection = () => {
        validateAndNavigate(null);
    }

    const refreshOrders = async () => {
        setUpadteLoading(true)
        const response = await axios.post(`${API_URL}/api/v1/order/updateOrders`);
        setUpadteLoading(false)
    }

    const toOnChange = (value) => {
        setTo(value);
        localStorage.setItem('to', value);
    }
    const fromOnChange = (value) => {
        setFrom(value);
        localStorage.setItem('from', value);
    }



    return (
        <div>
        <button onClick={logout} className="absolute top-3 right-3">Logout</button>
            
            <div className="flex items-center space-x-2 justify-center mt-20">
            <label htmlFor="simpleCheckbox" className="text-gray-700 select-none ">
                Bag Id required?
            </label>
            <input
                type="checkbox"
                id="simpleCheckbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />

            </div>
        <div className="flex flex-col h-[60vh] justify-around">
        <div className="flex flex-col p-4 space-y-4">
            <label htmlFor="fromInput" className="block text-sm font-medium text-gray-700">
                From
                <input
                    id="fromInput"
                    type="text"
                    placeholder="from"
                    onChange={(e) => fromOnChange(e.target.value)}
                    // onChange={(e) => setFrom(e.target.value)}

                    value={fromValue}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </label>
            <label htmlFor="toInput" className="block text-sm font-medium text-gray-700">
                To
                <input
                    id="toInput"
                    type="text"
                    placeholder="to"
                    onChange={(e) => toOnChange(e.target.value)}
                    // onChange={(e) => setTo(e.target.value)}
                    value={toValue}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </label>
        </div>
            <div>
                <button onClick={handlePrepaidSelection} className="m-3">Prepaid</button> 
                <button onClick={handleAllSelection} className="m-3">All</button>
                <button onClick={handlePostPaidSelection} className="m-3">Cash On delivery</button>
            </div>
            <div>
                <button onClick={refreshOrders} className="m-3">refresh orders</button>
                {upadteLoading && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2 text-white2">Refreshing</h2>
                </div>
                </div>
                )}
            </div>
        </div>
        </div>
    );
}

export default Select;
