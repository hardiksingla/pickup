import Express from "express";
import zod from "zod";
import axios from "axios";
import { User , Order, ProductOrdered, Product} from "../db";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { authMiddleware } from "../middleware";
dotenv.config();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;


const router = Express.Router();

const productSubmitZod = zod.object({
    orderId: zod.number(),
    status: zod.enum(["completed", "skipped"])
});


router.get('/order', async (req, res) => {
    const order : any= await Order.findOne({status : "pending"});
    if (!order){
        res.status(200).json({message : "No pending orders" , messageStatus: 0});

        return;
    }
        //     const response =  await axios.get("https://${SHOPIFY_API_KEY}/admin/orders.json")
    //     for (const orderData of response.data.orders) {
    //         const paymentStatus = Array.isArray(orderData.payment_gateway_names) && orderData.payment_gateway_names.length > 0
    //                             ? orderData.payment_gateway_names[0]
    //                             : 'Unknown Payment Status';
    //         const order = new Order({
    //             orderNo: orderData.order_number,
    //             status: "pending",
    //             paymentStatus: paymentStatus
    //         });
    //         await order.save();
    //         for (const lineItem of orderData.line_items) {
    //             const productOrdered = new ProductOrdered({
    //                 orderId: orderData.order_number,
    //                 productId: lineItem.id,
    //                 quantity: lineItem.quantity
    //             });
    //             await productOrdered.save();                   
    //         }
            
            
    //         console.log(order)
    //         }
    //     return res.status(200).json(order);
    // }

    // console.log(order);

    let products : any = [];

    const orderId = order.id;
    const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders/${orderId}.json`);
    console.log(order)
    for (const lineItem of orderDetails.data.order.line_items){
        const productId = lineItem.product_id;
        const product : any = await axios.get(`https://${SHOPIFY_API_KEY}/admin/products/${productId}.json`);
        // console.log(product.data.product);
        products.push({
            name : product.data.product.title,
            sku : lineItem.sku,
            quantity : lineItem.quantity,
            image : product.data.product.image !== null && product.data.product.image.src !== null ? product.data.product.image.src : "null",
            location: product.data.product.variants[0].inventory_item_id
        });
    }
    const data = {
        orderId : order.orderNo,
        products : products,
        paymentStatus: order.paymentStatus
    }
    // order.status = "allocated";
    // await order.save();


    res.status(200).json(data);
})

router.get("/updateProducts", async (req, res) => {
    const response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/products.json`)
    const prevProducts = await Product.find({});
    const prevProductsList = [];
    for (const product of prevProducts){ 
        prevProductsList.push(product.id);
    }
    console.log(prevProductsList);
    for (const product of response.data.products){
        console.log(product.id);
        if (!prevProductsList.includes(product.id.toString())){
            const newProduct = new Product({
                id: product.id,
                name: product.title,
                sku: product.variants[0].sku,
                location: product.variants[0].inventory_item_id,
                image: product.image !== null && product.image.src !== null ? product.image.src : "null"
            });
            await newProduct.save();
        }
    }
    res.status(200).json({status : "success"});
    
});

router.get("/updateOrders", async (req, res) => {
    const response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders.json`)
    const prevOrders = await Order.find({});
    console.log(prevOrders);
    const prevOrdersList = [];
    for (const order of prevOrders){ 
        prevOrdersList.push(order.orderNo);
    }
    console.log(prevOrdersList);
    for (const order of response.data.orders){
        console.log(order.order_number);
        if (!prevOrdersList.includes(order.order_number)){
            const paymentStatus = Array.isArray(order.payment_gateway_names) && order.payment_gateway_names.length > 0
                                ? order.payment_gateway_names[0]
                                : 'Unknown Payment Status';
            const newOrder = new Order({
                id : order.id,
                orderNo: order.order_number,
                status: "pending",
                paymentStatus: paymentStatus
            });
            await newOrder.save();
            for (const lineItem of order.line_items){
                const productOrdered = new ProductOrdered({
                    orderId: order.order_number,
                    productId: lineItem.product_id,
                    quantity: lineItem.quantity
                });
                await productOrdered.save();
            }
        }
    }
    res.status(200).json({status : "success"});
})


router.post('/submit', async (req, res) => {
    console.log(req.body);
    const validationResult : any = productSubmitZod.safeParse(req.body);
    console.log(validationResult);
    if (!validationResult.success){
        res.status(400).json({ message: "Invalid request submit" });
        return
    }
    const {orderId , status } = req.body;
    const order : any = await Order.findOne({orderNo : orderId});
    if (!order){
        res.status(400).json({ message: "Invalid order" });
        return
    }
    order.status = status === "completed" ? "completed" : "skipped";

    await order.save();

    res.status(200).json({ message: "Order updated" , status:1});
});



export default router;
