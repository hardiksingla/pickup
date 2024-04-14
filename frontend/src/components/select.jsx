import { useRecoilState, useSetRecoilState } from "recoil";
import { prepaidReq, from, to } from "../store/atoms/barcode";
import { useNavigate } from 'react-router-dom';

function Select() {
    const [isPrepaid, setPrepaid] = useRecoilState(prepaidReq);
    const navigate = useNavigate();
    const [fromValue, setFrom] = useRecoilState(from);
    const [toValue, setTo] = useRecoilState(to);

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
        <div className="flex flex-col h-[60vh] justify-around">
            <div>
                <input placeholder="from" onChange={(e) => setFrom(e.target.value)} className="m-3 p-1" value={fromValue} />
                <input placeholder="to" onChange={(e) => setTo(e.target.value)} className="m-3 p-1" value={toValue}/>
            </div>
            <div>
                <button onClick={handlePrepaidSelection} className="m-3">Prepaid</button> 
                <button onClick={handlePostPaidSelection} className="m-3">Cash On delivery</button>
            </div>
        </div>
    );
}

export default Select;
