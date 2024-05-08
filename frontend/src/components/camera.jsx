import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import Quagga from 'quagga'; // Import Quagga
import { useRecoilState } from "recoil";
import { barcodeValue, scanningProduct, bagId } from "../store/atoms/barcode";

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [barcode, setBarcode] = useRecoilState(barcodeValue);
  const [devices, setDevices] = useState([]);
  const [videoDeviceId, setVideoDeviceId] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [scanningProductValue, setscanningProduct] = useRecoilState(scanningProduct);
  const [isOpen, setIsOpen] = useState(false);
  const [bagIdValue, setBagIdValue] = useRecoilState(bagId);
  const [test, setTest] = useState("")
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

  const handleDetected = (result) => {
    let bv = result.codeResult.code;
    if (result.codeResult) {
      console.log(result.codeResult.code);
      if (scanningProductValue){
        setBarcode(result.codeResult.code);
      }else{
        if (bv.length === 9){
          setBarcode(result.codeResult.code);
          setBagIdValue(result.codeResult.code);
          setscanningProduct(true);
          setBarcode("");
        }
        else{
          setIsOpen(true);
        } 
      }
    }
  };

  useEffect(() => {
    if (videoDeviceId && webcamReady) {
      Quagga.init({
        inputStream: {
          type: "LiveStream",
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment",
            deviceId: videoDeviceId
          },
          target: webcamRef.current.video // Adjusted to use the video element directly
        },
        decoder: {
          readers: ["code_128_reader"] // Specify barcode types
        },
      }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
        Quagga.onDetected(handleDetected);
      });

      return () => {
        Quagga.stop();
        Quagga.offDetected(handleDetected);
      };
    }
  }, [videoDeviceId, webcamReady ,scanningProductValue]);

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
                    <p>{test}</p>
                </div>
                </div>
      )}
      
      <div className='flex w-full justify-between'>
        <Webcam
          className='max-h-40 object-cover w-[95%]'
          audio={false}
          ref={webcamRef}
          onUserMedia={() => setWebcamReady(true)} // Set the webcam ready state when media is available
          screenshotFormat="image/jpeg"
          videoConstraints={{ deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined }}
        />
        <button onClick={() => setShowPopup(true)} className='w-1/12'>Camera</button>
      </div>
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
