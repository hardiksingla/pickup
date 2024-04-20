import Express from "express";
import zod from "zod";
import axios from "axios";
import { User , Order, ProductOrdered, Product} from "../db";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { authMiddleware } from "../middleware";
dotenv.config();
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    phoneNumber?: string;
  }
}

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;


const router = Express.Router();

const productSubmitZod = zod.object({
    orderId: zod.number(),
    status: zod.enum(["completed", "skipped"])
});


router.post('/order',authMiddleware, async (req, res) => {
    console.log(req.body.from , req.body.to , req.phoneNumber , req.body.isPrepaid);
    let order: any = await Order.findOne({
        status: req.phoneNumber,
        prepaid: req.body.isPrepaid,
        orderNo: {
            $gte: req.body.from,
            $lte: req.body.to
        }
    });
    if (!order){
        order  = await Order.findOne({status : "pending" , prepaid : req.body.isPrepaid , orderNo : { $gt: req.body.from, $lt: req.body.to } });
    }
    if (!order){
        res.status(200).json({message : "No pending orders" , messageStatus: 0});
        return;
    }
    let products : any = [];
    const orderId = order.id;
    const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders/${orderId}.json`);
    for (const lineItem of orderDetails.data.order.line_items){
        console.log("32.lineItem",lineItem)
        const productId = lineItem.product_id;
        if (productId === null){
            continue;
        }
        const product : any = await axios.get(`https://${SHOPIFY_API_KEY}/admin/products/${productId}.json`);
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

    order.status = req.phoneNumber;
    await order.save();


    res.status(200).json(data);
})


// product db not required
router.get("/updateProducts", async (req, res) => {
    const response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/2024-01/products.json`)
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

router.post("/updateOrders", async (req, res) => {
    console.log("updateOrders");
    let deleteArr = [];
    deleteArr.push("pending")
    const users = await User.find({})
    for (const user of users){
        deleteArr.push(user.phoneNumber);
    }
    console.log(deleteArr)
    try {
        const result = await Order.deleteMany({ "status": { $in: deleteArr }});
        console.log(result.deletedCount + ' pending orders were deleted.');
    } catch (error) {
        console.error('Error deleting pending orders:', error);
    }

    
    let moreOrders = true;
    let nextid = 5907417530651;
    while (moreOrders){
        const prevOrders = await Order.find({});
        let response : any;
        // console.log(`https://${SHOPIFY_API_KEY}/admin/orders.json?limit=250&since_id=${highestOrdernumberid}`);
        response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders.json?limit=250&since_id=${nextid}`)
        if (response.data.orders.length === 0){
            moreOrders = false;
        }else{
            nextid = response.data.orders[response.data.orders.length-1].id;            
            console.log(response.data.orders[response.data.orders.length-1].id);
            console.log(nextid);
        }
        
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
                if (order.fulfillment_status != "fulfilled"){
                    const newOrder = new Order({
                        id : order.id,
                        orderNo: order.order_number,
                        status: "pending",
                        paymentStatus: paymentStatus,
                        prepaid: order.financial_status === "paid" ? true : false,
                        createdAt : new Date()

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
        }
    }
    res.status(200).json({status : "success"});
})


router.post('/submit', async (req, res) => {
    console.log("submit" , req.body);
    const validationResult : any = productSubmitZod.safeParse(req.body);
    console.log("vlaidation error " ,validationResult.error);
    if (!validationResult.success){
        console.log("Invalid request submit ")
        res.status(400).json({ message: "Invalid request submit" });
        return
    }
    const {orderId , status } = req.body;
    const order : any = await Order.findOne({orderNo : orderId});
    if (!order){
        res.status(400).json({ message: "Invalid order" });
        return
    }
    order.status = status === "completed" ? "completed" : req.body.comment;
    order.bagId = req.body.bagId;
    order.skipReason = req.body.comment;

    await order.save();

    res.status(200).json({ message: "Order updated" , status:1});
});



export default router;
