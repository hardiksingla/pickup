import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API_URL } from "../config.js";

function Skipped() {
    const [skippedOrderData, setSkippedOrderData] = useState(null);
    const [products, setProducts] = useState([]);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function fetchSkippedOrderData() {   
            try {
                const response = await axios.post(`${API_URL}/api/v1/order/getskipped` , { orderNo: 0 , prev : false , next : true});
                setSkippedOrderData(response.data.skipped);
            } catch (error) {
                console.error('Error fetching skipped order data:', error);
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

    const handlePrev = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/order/getskipped`, { orderNo: skippedOrderData.orderNo , prev : true , next : false});
            setSkippedOrderData(response.data.skipped);
            console.log(response.data.skipped);
        } catch (error) {
            console.error('Error fetching previous skipped order data:', error);
        }
    }
    const handleNext = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/order/getskipped`, { orderNo: skippedOrderData.orderNo , prev : false , next : true});
            setSkippedOrderData(response.data.skipped);
            console.log(response.data.skipped);
        } catch (error) {
            console.error('Error fetching previous skipped order data:', error);
        }
    }
    const handleComplete = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/order/submit`, {
                orderId: skippedOrderData.orderNo,
                status: 'completed'
            });
            console.log(response);
            if (response.data.status === 1) {
                // setProducts([]);
                // setCompleted(0);
                // setTotal(0);
                // setSkippedOrderData(null);
                handleNext();   
            }
        } catch (error) {
            console.error('Error completing skipped order:', error);
        }
    }

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
            {
                products.length > 0 ?
                <p className='m-5'>skip reason : {skippedOrderData.status}</p>
                : null
            }
            <div className='flex justify-around'>
                <button onClick={handlePrev}>Previous</button>
                <button onClick={handleComplete}>Complete</button>
                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    )
}

export default Skipped
