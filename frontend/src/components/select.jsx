import { useRecoilState } from "recoil";
import { prepaidReq } from "../store/atoms/barcode";
import { useNavigate } from 'react-router-dom';

function Select() {
    const [isPrepaid, setPrepaid] = useRecoilState(prepaidReq);
    const navigate = useNavigate();

    const handlePrepaidSelection = () => {
        setPrepaid(true);
        navigate('/home');        
    }

    const handlePostPaidSelection = () => {
        setPrepaid(false);
        navigate('/home');
    }

    return (
        <div>
            <button onClick={handlePrepaidSelection}>Prepaid</button> 
            <button onClick={handlePostPaidSelection}>Cash On delivery</button>
        </div>
    );
}

export default Select;