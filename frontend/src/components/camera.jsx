import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useRecoilState } from "recoil";
import { barcodeValue } from "../store/atoms/barcode";

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [barcode, setBarcode] = useRecoilState(barcodeValue);
  const [devices, setDevices] = useState([]);
  const [videoDeviceId, setVideoDeviceId] = useState();
  const [showPopup, setShowPopup] = useState(false);

  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  useEffect(() => {
  }, [devices]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const interval = setInterval(() => {
      const capture = webcamRef.current.getScreenshot();
      if (capture) {
        codeReader.decodeFromImage(undefined, capture).then((result) => {
          // if (!scanningProductValue) {
          //   setbagId(result.text);
          //   setscanningProduct(true);
          // }
          setBarcode(result.text);
        }).catch((err) => {
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoDeviceId]);

  return (
    <div>
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
