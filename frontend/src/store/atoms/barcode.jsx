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

export const scanningProduct = atom({
    key: 'scanningProduct',
    default: false
});

export const bagId = atom({
    key: 'bagId',
    default : 0
});
// export const bagIdLength = selector({
//     key: 'bagIdLength',
//     get: ({get}) => {
//       const barcode = get(bagId);
//       return barcode.length;
//     }
//   });

export const bagIdReq = atom({
    key: 'bagIdReq',
    default: true
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

export const prepaidReq = atom({
  key: 'prepaidReq',
  default: true
});

export const from = atom({
  key: 'from',
  default: ''
});

export const to = atom({
  key: 'to',
  default: ''
});
