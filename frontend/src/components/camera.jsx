import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useRecoilState } from "recoil";
import { barcodeValue , scanningProduct , bagId } from "../store/atoms/barcode";
import TextBox from './textbox';

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [barcode, setBarcode] = useRecoilState(barcodeValue);
  const [devices, setDevices] = useState([]);
  const [videoDeviceId, setVideoDeviceId] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [scanningProductValue, setscanningProduct] = useRecoilState(scanningProduct);
  const [isOpen, setIsOpen] = useState(false);
  const [bagIdValue, setBagIdValue] = useRecoilState(bagId);
  const [barcodetest, setBarcodeTest] = useState("");

  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  useEffect(() => {
  }, [devices]);

  const barcodeRead = (result) => {
    console.log(result);
      if (result.length === 9){
        setBarcode(result);
        setBagIdValue(result);
        setscanningProduct(true);
        setBarcode("");
      }
      else{
        setIsOpen(true);
      }      

  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const interval = setInterval(() => {
      const capture = webcamRef.current.getScreenshot();
      if (capture) {
        codeReader.decodeFromImage(undefined, capture).then((result) => {
          if (scanningProductValue){
            setBarcode(result);
          }else{
            barcodeRead(result.text);
          }
        }).catch((err) => {
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoDeviceId , scanningProductValue]);

  return (
    <div>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2 text-white2">Not A Bag Id</h2>
                    {/* <p className="text-gray-700 mb-4 text-white2">All the Items Have Not Been Picked Yet</p> */}
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
      <Webcam
        className='max-h-40 object-cover w-10/12'
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined }}
        // style={{ width : '50%' }}
      />
      <button onClick={() => setShowPopup(true)}>C</button>
    </div>
      {/* <p>Detected Barcode: {barcode}</p> */}
      {showPopup && (
        <div style={{ position: 'absolute', padding: '20px', zIndex: 100 }} className='bg-black w-[100vw]'>
          <h2>Select Camera</h2>
          {devices.map((device, key) => (
            <div key={device.deviceId}>
              <button onClick={() => { setVideoDeviceId(device.deviceId); setShowPopup(false); }}>
                {device.label || `Device ${key + 1}`}
              </button>
            </div>
          ))}
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
