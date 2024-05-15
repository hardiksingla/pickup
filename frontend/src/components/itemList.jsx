import { useEffect, useState } from "react";
import { useRecoilState } from 'recoil';
import { orderDetails } from '../store/atoms/barcode';

const ItemList = () => {
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (!orderDetailsData.products || orderDetailsData.products.length === 0) {
            return;
        }
        setProducts(orderDetailsData.products.map((product , index) => (
            <div key={`${product.productId}-${product.sku}-${index}`} className={`flex justify-between m-5 border-2 p-1 ${product.completionStatus === product.quantity ? 'bg-bggr' : ''}`}>
                <img src={product.image} alt="Product" className="w-20 h-20" />
                <div className="w-full">
                    <p>{product.name}</p>
                    <p>{product.completionStatus}/{product.quantity}</p>
                    <p>{product.sku}</p>
                </div>
            </div>
        )));
        
    }, [orderDetailsData]); 

    if (!orderDetailsData.products || orderDetailsData.products.length === 0) {
        return <div>No Pending Orders</div>;
    }

    return (
        <div className="h-96 overflow-auto">
            {products}
        </div>
    );
};

export default ItemList;
