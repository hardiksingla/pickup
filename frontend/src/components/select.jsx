import { useRecoilState, useSetRecoilState } from "recoil";
import { prepaidReq, from, to ,bagIdReq } from "../store/atoms/barcode";
import { useNavigate } from 'react-router-dom';

function Select() {
    const [isPrepaid, setPrepaid] = useRecoilState(prepaidReq);
    const navigate = useNavigate();
    const [fromValue, setFrom] = useRecoilState(from);
    const [toValue, setTo] = useRecoilState(to);
    const [isChecked, setIsChecked] = useRecoilState(bagIdReq);
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
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
        }

        // Check and set default for 'to' if not provided or invalid
        if (isNaN(toVal) || toVal === 0) {
            toVal = 99999999;
            setTo('99999999'); // Update the 'to' state with the default value
        }
        if (toVal >= fromVal) {
            setPrepaid(isPrepaidOption); // Update the prepaid status based on the button clicked
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


    return (
        <div>
            <div className="flex items-center space-x-2 w-[100vw] justify-center mt-20">
            <label htmlFor="simpleCheckbox" className="text-gray-700 select-none">
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
                    onChange={(e) => setFrom(e.target.value)}
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
                    onChange={(e) => setTo(e.target.value)}
                    value={toValue}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </label>
        </div>
            <div>
                <button onClick={handlePrepaidSelection} className="m-3">Prepaid</button> 
                <button onClick={handlePostPaidSelection} className="m-3">Cash On delivery</button>
            </div>
        </div>
        </div>
    );
}

export default Select;
