import React from 'react'
import { useRecoilState } from 'recoil';
import { bagId , bagIdReq } from '../store/atoms/barcode';
import { useState } from 'react'; 

function BagId() {
    const [bagIdValue, setBagIdValue] = useRecoilState(bagId);
    const [isChecked, setIsChecked] = useRecoilState(bagIdReq);

    // const handleCheckboxChange = () => {
    //     setIsChecked(!isChecked);
    // };

    return (
        <div className='flex justify-around'>
            { isChecked && 
            <p>Bag-Id : {bagIdValue}</p>
            }
            {/* <div className="flex items-center space-x-2">
            <label htmlFor="simpleCheckbox" className="text-gray-700 select-none">
                Bag Id required?
            </label>
            <input
                type="checkbox"
                id="simpleCheckbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />

        </div> */}
        </div>
    );
}

export default BagId;
