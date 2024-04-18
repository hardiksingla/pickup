import { useRecoilState , useRecoilValue } from "recoil";
import { barcodeValue , orderDetails , barcodeValueLength , scanningProduct , bagId } from '../store/atoms/barcode';
import { useEffect , useState } from "react";


const TextBox = () => {
    const [barcode, setBarcode] = useRecoilState(barcodeValue);
    const [orderDetail, setOrderDetailsData] = useRecoilState(orderDetails);
    const barcodevalueLengthVal = useRecoilValue(barcodeValueLength);
    const [isRed, setIsRed] = useState(false);
    const [scanningProducts, setScanningProduct] = useRecoilState(scanningProduct);
    const [bagIdValue, setBagIdValue] = useRecoilState(bagId);

    const handleChange = (e) => {
        setBarcode(e.target.value);
    };
    useEffect(() => {    
            // console.log("Barcode length is 10:", barcode , barcodevalueLength);
            // console.log(orderDetail)
            if (barcodevalueLengthVal == 9 && !scanningProducts) {
                console.log("Barcode length is not 9")
                setBagIdValue(barcode);
                setBarcode("");
                setScanningProduct(true);
            }
            if (scanningProducts) {
            let productIndex = -1;
            if (orderDetail.products) {
                console.log("orderDetail.products", orderDetail.products);
                productIndex = orderDetail.products.findIndex(product => product.sku == barcode);
            }
            
            console.log("prod index" , productIndex);
            // if productIndex == 
            if (productIndex !== -1) {
                if (orderDetail.products[productIndex].completionStatus === orderDetail.products[productIndex].quantity) {
                    setIsRed(true);
                    setTimeout(() => {
                        setIsRed(false);
                    }, 1000);
                    console.log(`Product with SKU ${barcode} already completed.`);
                    setBarcode("");
                    return;
                }
                let updatedOrderDetail = {
                    orderId  : orderDetail.orderId,
                    products : orderDetail.products.map((product) => {
                        return {...product}
                    }),
                    paymentStatus : orderDetail.paymentStatus
                 }; 
                console.log(updatedOrderDetail);
                updatedOrderDetail.products[productIndex].completionStatus += 1;
                setOrderDetailsData(updatedOrderDetail);
                setBarcode("");
            } else {
                setIsRed(true);
                setTimeout(() => {
                    setIsRed(false);
                }, 1000);
                console.log(`Product with SKU ${barcode} not found.`);
        

            // Log the updated order
            console.log(orderDetail);
            }

        }
    }, [barcode]);

    function submitBagId() {
        console.log("BagId submitted");
        setScanningProduct(true);
        setBagIdValue(barcode);
        setBarcode("");
    }

    return (
        <div className={`my-5`}>
            <input type="text" onChange={handleChange} value={barcode} style={{ color: isRed ? 'red' : 'white' }} />
            {/* {!scanningProducts && <button onClick={submitBagId} className="ml-2">Submit BagId</button>} */}
        </div>
    );
}

export default TextBox;