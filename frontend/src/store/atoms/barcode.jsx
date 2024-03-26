import {atom,selector} from 'recoil';

export const barcodeValue = atom({
    key: 'barcodeValue',
    default: ''
  });

export const barcodeValueLength = selector({
    key: 'barcodeValueLength',
    get: ({get}) => {
      const barcode = get(barcodeValue);
      return barcode.length;
    }
  });

export const orderDetails = atom({
    key: 'orderDetails',
    default: []
  });

export const itemNo = selector({
  key:"itemNo",
  get : ({get}) => {
    const order = get(orderDetails);
    // console.log(order.products)
    let num = 0
    let compNum = 0
    if (order.products === undefined || order.products.length === 0){
      return 0
    }
    for (const product of order.products){
      num = num + product.quantity
      compNum += product.completionStatus
    }
    return {
      total : num,
      completed : compNum
    };
  }
})