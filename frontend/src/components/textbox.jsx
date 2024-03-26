import { useRecoilState , useRecoilValue } from "recoil";
import { barcodeValue , orderDetails , barcodeValueLength } from '../store/atoms/barcode';
import { useEffect , useState } from "react";


const TextBox = () => {
    const [barcode, setBarcode] = useRecoilState(barcodeValue);
    const [orderDetail, setOrderDetailsData] = useRecoilState(orderDetails);
    const barcodevalueLength = useRecoilValue(barcodeValueLength);
    const [isRed, setIsRed] = useState(false);

    const handleChange = (e) => {
        setBarcode(e.target.value);
    };
    useEffect(() => {
        if (barcode.length === 10) {
            console.log("Barcode length is 10:", barcode , barcodevalueLength);
            console.log(orderDetail)
            const productIndex = orderDetail.products.findIndex(product => product.sku == barcode);
            console.log(productIndex);
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
            }

            // Log the updated order
            console.log(orderDetail);

        }
    }, [barcode]);
    return (
        <div className={`my-5`}>
            <input type="text" onChange={handleChange} value={barcode} style={{ color: isRed ? 'red' : 'white' }} />
        </div>
    );
}

export default TextBox;