import React from 'react'
import { useRecoilState } from 'recoil';
import { bagId } from '../store/atoms/barcode';

function BagId() {
    const bagIdValue = useRecoilState(bagId);

    return (
    <div>
      Bag-Id : {bagIdValue}
    </div>
  )
}

export default BagId
