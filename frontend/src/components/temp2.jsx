import { useRecoilState, useRecoilValue } from "recoil";
import { barcodeValue, orderDetails, barcodeValueLength, scanningProduct, bagId } from '../store/atoms/barcode';
import { useEffect, useState, useRef } from "react";

const TextBox = () => {
    const [barcode, setBarcode] = useRecoilState(barcodeValue);
    const [orderDetail, setOrderDetailsData] = useRecoilState(orderDetails);
    const barcodevalueLengthVal = useRecoilValue(barcodeValueLength);
    const [isRed, setIsRed] = useState(false);
    const [scanningProducts, setScanningProduct] = useRecoilState(scanningProduct);
    const [bagIdValue, setBagIdValue] = useRecoilState(bagId);
    const [isReadOnly, setIsReadOnly] = useState(true); // New state for readonly toggle
    const inputRef = useRef(null);

    const handleChange = (e) => {
        setBarcode(e.target.value);
    };

    const handleDetected = (scannedValue) => {
        if (scannedValue) {
            console.log(scannedValue);
            if (scanningProducts) {
                setBarcode(scannedValue);
            } else {
                if (scannedValue.length === 9) {
                    setBarcode(scannedValue);
                    setBagIdValue(scannedValue);
                    setScanningProduct(true);
                    setBarcode("");
                } else {
                    setIsRed(true);
                    setTimeout(() => {
                        setIsRed(false);
                    }, 1000);
                    console.log("Not a Bag ID");
                }
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action of Enter key
            handleDetected(event.target.value);
            setBarcode(''); // Clear the input after processing
        }
    };

    useEffect(() => {
        if (barcodevalueLengthVal == 9 && !scanningProducts) {
            console.log("Barcode length is 9 and not scanning products");
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

            console.log("Product index", productIndex);
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
                    orderId: orderDetail.orderId,
                    products: orderDetail.products.map((product) => {
                        return { ...product }
                    }),
                    paymentStatus: orderDetail.paymentStatus
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

    function submitBagId() {
        console.log("BagId submitted");
        setScanningProduct(true);
        setBagIdValue(barcode);
        setBarcode("");
    }

    useEffect(() => {
        const focusInput = (event) => {
            if (inputRef.current) {
              setIsReadOnly(true);
              inputRef.current.focus();
              setTimeout(() => {
                setIsReadOnly(false);
              }, 100); // Make the input read-only again after a short delay
            }
          };

        document.addEventListener('keydown', focusInput);

        // Focus the input field when the component mounts
        focusInput();

        return () => {
            document.removeEventListener('keydown', focusInput);
        };
    }, []);

    const toggleReadOnly = () => {
        setIsReadOnly((prev) => !prev);
    };

    return (
        <div className="my-5">
            <input
                ref={inputRef}
                type="text"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                value={barcode}
                style={{ color: isRed ? 'red' : 'black' }}
                className="border-4 border-black"
                placeholder=""
                readOnly={isReadOnly} // Controlled by isReadOnly state
            />
            {/* <button onClick={toggleReadOnly} className="ml-2 p-2 border-2 border-black bg-gray-200">
                {isReadOnly ? 'Enable Input' : 'Disable Input'}
                E
            </button> */}
        </div>
    );
}

export default TextBox;
