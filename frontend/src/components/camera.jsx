import React, { useState, useEffect, useRef } from 'react';
import { useRecoilState } from "recoil";
import { barcodeValue, scanningProduct, bagId } from "../store/atoms/barcode";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useRecoilState(barcodeValue);
  const [devices, setDevices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [scanningProductValue, setscanningProduct] = useRecoilState(scanningProduct);
  const [isOpen, setIsOpen] = useState(false);
  const [bagIdValue, setBagIdValue] = useRecoilState(bagId);
  const inputRef = useRef(null);
  const [isEditable, setIsEditable] = useState(false);

  const handleDevices = React.useCallback(
    mediaDevices => setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleDetected = (scannedValue) => {
    if (scannedValue) {
      console.log(scannedValue);
      if (scanningProductValue) {
        setBarcode(scannedValue);
      } else {
        if (scannedValue.length === 9) {
          setBarcode(scannedValue);
          setBagIdValue(scannedValue);
          setscanningProduct(true);
          setBarcode("");
        } else {
          setIsOpen(true);
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
    const focusInput = (event) => {
      if (inputRef.current) {
        setIsEditable(true);
        inputRef.current.focus();
        setTimeout(() => {
          setIsEditable(false);
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

  return (
    <div>
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
      
      <div className='flex w-full justify-between'>
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={!isEditable} // Make the input read-only by default
          className='max-h-40 object-cover w-[95%]'
          placeholder="Scan barcode here"
        />
      </div>
    </div>
  );
};

export default BarcodeScanner;
