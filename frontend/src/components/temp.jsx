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
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const [isEditable, setIsEditable] = useState(false);
    
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
                    setIsOpen(true);
                    console.log("Not a Bag ID");
                }
            }
        }
    };

    const togglePopup = () => {
        setIsOpen(!isOpen);
      };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action of Enter key
            handleDetected(event.target.value);
            setBarcode(''); // Clear the input after processing
        }
    };

    useEffect(() => {
        const focusInput = (event) => {
          if (inputRef.current) {
            setIsEditable(true);
            inputRef.current.focus();
            setTimeout(() => {
              setIsEditable(false);
            }, 1); // Make the input read-only again after a short delay
          }
        };
        document.addEventListener('keydown', focusInput);

        // Focus the input field when the component mounts
        focusInput();

        return () => {
            document.removeEventListener('keydown', focusInput);
        };
    }, []);

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
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    

    return (
        <div className={`my-5`}>
            <input
                ref={inputRef}
                type="text"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                value={barcode}
                readOnly={!isEditable}
                style={{ color: isRed ? 'red' : 'white' }}
                className="border-4 border-black"
                placeholder=""
            />
            {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2 text-white2">Not A Bag Id</h2>
                <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                onClick={togglePopup}
                >
                Close
                </button>
            </div>
            </div>
            )}
        </div>
        
    );
}

export default TextBox;
