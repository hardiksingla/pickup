import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API_URL } from "../config.js";
import { useRecoilState } from 'recoil';
import { completeOrderNo } from '../store/atoms/barcode';

function Completed() {
    const [skippedOrderData, setSkippedOrderData] = useState(null);
    const [products, setProducts] = useState([]);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [orderNo, setOrderNo] = useRecoilState(completeOrderNo);
    const [dataFetched, setDataFetched] = useState(false);
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
    useEffect(() => {
        async function fetchSkippedOrderData() {   
            try {
                const response = await axios.post(`${API_URL}/api/v1/order/getcompleted` , { orderNo: orderNo });
                setSkippedOrderData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching skipped order data:', error);
            }finally{
                setDataFetched(true);
            }
        }
        fetchSkippedOrderData();
    }, []);

    useEffect(() => {
        if (skippedOrderData && skippedOrderData.productStatus) {
            const productElements = skippedOrderData.productStatus.map((product, index) => (
                <div key={`${product.productId}-${product.sku}-${index}`} className={`flex justify-between m-5 border-2 p-1 ${product.completionStatus === product.quantity ? 'bg-bggr' : ''}`}>
                    <img src={product.image} alt="Product" className="w-20 h-20" />
                    <div className="w-full">
                        <p>{product.name}</p>
                        <p>{product.completionStatus}/{product.quantity}</p>
                        <p>{product.sku}</p>
                    </div>
                </div>
            ));
            setProducts(productElements);

            const totalCompleted = skippedOrderData.productStatus.reduce((acc, product) => acc + product.completionStatus, 0);
            const totalQuantity = skippedOrderData.productStatus.reduce((acc, product) => acc + product.quantity, 0);
            
            setCompleted(totalCompleted);
            setTotal(totalQuantity);
        }
    }, [skippedOrderData]);


    return (
        <div>
            {
                products.length > 0 ? 
                <div className="flex justify-around my-2">
                    <p className="text-3xl">{skippedOrderData.orderNo}</p>
                    <p className="text-l">{skippedOrderData.paymentStatus === "Cash on Delivery (COD)" ? "COD" : skippedOrderData.paymentStatus}</p>
                    <p className="text-xl">
                        {completed}/{total}
                    </p>
                </div> : null}
            <div className="h-96 overflow-auto">
                {products.length > 0 ? products : <p>No skipped products found.</p>}
            </div>
            {/* {
                products.length > 0 ? 
                <p className='m-5'>fulfilled on : {skippedOrderData.fulfilledOn}</p>    
                {skippedOrderData.bagId ? <p className='m-5'>Bag ID : {skippedOrderData.bagId}</p> : null}
                : null
            } */}
            {dataFetched && skippedOrderData && skippedOrderData.fulfilledOn ? <p className='m-2'>fulfilled on : {skippedOrderData.fulfilledOn}</p> : null}
            {dataFetched && skippedOrderData && skippedOrderData.bagId ? <p className='m-2'>bagId : {skippedOrderData.bagId}</p> : null}
            {dataFetched && skippedOrderData && skippedOrderData.fulfilledBy ? <p className='m-2'>fulfilled By : {skippedOrderData.fulfilledBy}</p> : null}
            {dataFetched && skippedOrderData && skippedOrderData.fulfillmentTime ? <p className='m-2'>fulfillment time : {new Date(skippedOrderData.fulfillmentTime).toLocaleString('en-US', options)}</p> : null}
            {dataFetched && skippedOrderData ? (
            skippedOrderData.labelPrinted !== undefined ? (
                skippedOrderData.labelPrinted ? (
                <p className='m-2'>Label Printed</p>
                ) : (
                <p className='m-2'>Label not printed</p>
                )
            ) : null
            ) : null}
        </div>
    )
}

export default Completed
