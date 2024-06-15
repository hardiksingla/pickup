import Express from "express";
import zod from "zod";
import axios from "axios";
import { Order, Variable} from "../db";
import dotenv from 'dotenv';
import { authMiddleware } from "../middleware";
dotenv.config();

declare module 'express-serve-static-core' {
  interface Request {
    phoneNumber?: string;
  }
}

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

const router = Express.Router();

const productSubmitZod = zod.object({
    orderId: zod.number(),
    status: zod.enum(["completed", "skipped" , "manualComplete"]),
});


router.post('/order',authMiddleware, async (req, res) => {
    console.log(req.body);

    const update = {
        $set: {
            assignedTo: req.phoneNumber
        }
    };    
    const options = {
        new: true,
        runValidators: true
    };
    
    
    let query: any = {
        status: "pending",
        orderNo: {
        $gte: req.body.from,
        $lte: req.body.to
        },
        assignedTo : "null"
    };
    let order : any = {};
    if (req.body.orderType === "Prepaid" || req.body.orderType === "Postpaid" || req.body.orderType === "Both") {
        query.fulfilledOn = "null";
        
        // unassigned orders

        let assignedOrders = await Order.findOne({assignedTo: req.phoneNumber});
        if (assignedOrders){    
            console.log("Unassigning order", assignedOrders.orderNo);
            assignedOrders.assignedTo = "null";
            await assignedOrders.save();
        }

        if (req.body.yesterday == 'true') {
            const now = new Date();
            const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 0);
            query.orderedAt = { $lt : yesterday.toISOString() }
            
        }
        if (req.body.orderType === "Prepaid") {
            query.prepaid = true;
        } else if (req.body.orderType === "Postpaid") {
            query.prepaid = false;
        }
        order = await Order.findOneAndUpdate(query, update, options);
        if (!order){
            res.status(200).json({message : "No pending orders" , messageStatus: 0});
            return;
        }
    }
    else if (req.body.orderType === "Skipped") {    
        query.status = "skipped";
        order = await Order.findOneAndUpdate(query , update, options);
        if (!order){
            res.status(200).json({message : "No skipped orders" , messageStatus: 0});
            return;
        }
    }
    else{
        console.log("Invalid order type");
         return res.status(400).json({ message: "Invalid order type" });
    }      

    console.log("query",query);
    
    let products : any = [];
    const orderId = order.id;
    
    const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/orders/${orderId}.json`);

    const lineItems = orderDetails.data.order.line_items;

    for (const lineItem of lineItems) {
        const productId = lineItem.product_id;
        if (productId === null) {
            continue;
        }
        const currernt_quantity = lineItem.current_quantity;

        const product = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/products/${productId}.json`);

        const p = (order.productStatus).find((product) => {
            return product.productId == lineItem.product_id
        });

        products.push({
            name: product.data.product.title,
            productId: lineItem.product_id,
            sku: lineItem.sku,
            quantity: currernt_quantity,
            image: product.data.product.image !== null && product.data.product.image.src !== null ? product.data.product.image.src : "null",
            completionStatus: p.completionStatus
        });

    }
    const data = {
        orderId : order.orderNo,
        products : products,
        paymentStatus: order.paymentStatus,
        skipReason: order.skipReason ? order.skipReason : null
    }
    
    console.log("orderNo" , data.orderId);
    res.status(200).json(data);
})


router.post("/updateOrders2", async (req, res) => {
    console.log("updateOrders2");    
    let moreOrders = true;
    let startOrderNo : any
    if (req.body.from === null || req.body.from === undefined){
        startOrderNo = await Variable.findOne({ id: 1 });
        startOrderNo = startOrderNo.startId;
    }else{
        startOrderNo = req.body.from;
        let variable = await Variable.findOne({ id: 1 });
        variable.startId = startOrderNo;
        variable.save();
    }
    
    console.log(startOrderNo);

    const r =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders.json?name=${startOrderNo}&status=any`)
    let nextid = r.data.orders[0].id;
    
    const prevOrders = await Order.find({});

    const prevOrdersList = [];
    for (const order of prevOrders){ 
        prevOrdersList.push(order.orderNo);
    }
    
    while (moreOrders){
        let response : any;
        response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/orders.json?limit=250&since_id=${nextid}&status=any`)
        if (response.data.orders.length === 0){
            moreOrders = false;
        }else{
            nextid = response.data.orders[response.data.orders.length-1].id;            
            nextid = response.data.orders[response.data.orders.length-1].id;            
            console.log(response.data.orders[response.data.orders.length-1].id);
            console.log(nextid);
            nextid = response.data.orders[response.data.orders.length-1].id;
            console.log(response.data.orders[response.data.orders.length-1].id);
            console.log(nextid);
        }
        
        for (const order of response.data.orders){
            console.log(order.order_number);
            if (!prevOrdersList.includes(order.order_number)){
                
                const prepaid = order.financial_status === "paid" || order.financial_status === "partially_refunded" || order.financial_status === "partially_paid" ? true : false
                const paymentStatus = prepaid ? "Prepaid" : "COD";
                let productArr = [];
                for (const lineItem of order.line_items){
                    let productD = {
                        orderId: order.order_number,
                        productId: lineItem.product_id,
                        completionStatus : 0
                    }
                    // const productOrdered = new ProductOrdered(productD);
                    // await productOrdered.save();
                    productArr.push(productD);
                }

                let fulfilledOn = "null";
                let labelPrinted = false;
                if (order.fulfillment_status === "fulfilled") {
                    fulfilledOn = "shopify";
                    labelPrinted = true;
                }
                if (order.cancelled_at !== null){
                    console.log(order.cancelled_at);
                    console.log("cancelled added to mongo");
                    labelPrinted = true;
                    fulfilledOn = "cancelled";
                }

                const newOrder = new Order({
                    id : order.id,
                    orderNo: order.order_number,
                    status: "pending",
                    paymentStatus: paymentStatus,
                    prepaid: prepaid,
                    productStatus : productArr,
                    fulfilledOn : fulfilledOn,
                    orderedAt : order.created_at,
                    labelPrinted: labelPrinted,
                    assignedTo : "null"
                });
                try {
                    await newOrder.save();
                    console.log('Order saved successfully');
                } catch (error) {
                    if (error.code === 11000) {
                        // Duplicate key error
                        console.error('Duplicate order number:', order.order_number);
                    } else {
                        // Other errors
                        console.error('Error saving order:', error);
                    }
                }
            }
            else{
                const orderM = await Order.findOne({orderNo : order.order_number});
                

                if (order.cancelled_at !== null){
                    console.log(order.cancelled_at);
                    console.log("cancelled in mongo");
                    orderM.fulfilledOn = "cancelled";
                    try {
                        await orderM.save();
                    }
                    catch (error){
                        console.log("Error saving order", error);
                    }
                }

                else if(orderM.fulfilledOn === "null" && order.fulfillment_status === "fulfilled"){
                    orderM.fulfilledOn = "shopify";
                    orderM.labelPrinted = true;
                    try {
                        await orderM.save();
                    }
                    catch (error){
                        console.log("Error saving order", error);
                    }
                }           
            }
        }
    }
    res.status(200).json({status : "success"});
})


router.post('/submit', authMiddleware ,  async (req, res) => {
    const validationResult : any = productSubmitZod.safeParse(req.body);
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
    order.status = status;
    order.bagId = req.body.bagId;
    order.skipReason = req.body.comment;
    order.productStatus = req.body.products;
    order.fulfilledOn = status === "skipped" ? "null" : "app";
    if (status === "skipped"){
        order.skipExported = false;
    }
    order.fulfilledBy = req.phoneNumber;
    order.fulfillmentTime = new Date();
    order.assignedTo = "null";
    await order.save();

    res.status(200).json({ message: "Order updated" , status:1});
});


router.post('/getcompleted', async (req, res) => {
    console.log("Request to /getskipped with body:", req.body);
    
    const order = await Order.findOne({ orderNo : req.body.orderNo });
    if (!order){
        return res.status(400).json({ message: "Invalid value" });
    }
    else if (order.fulfilledOn == "shopify"){
        let products : any = [];
        const orderId = order.id;
        
        const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/orders/${orderId}.json`);
    
        const lineItems = orderDetails.data.order.line_items;
    
        for (const lineItem of lineItems) {
            const productId = lineItem.product_id;
            if (productId === null) {
                continue;
            }
    
            const product = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/products/${productId}.json`);
            const currernt_quantity = lineItem.current_quantity;
    
            const p = (order.productStatus).find((product) => {
                return product.productId == lineItem.product_id
            });
    
            products.push({
                name: product.data.product.title,
                productId: lineItem.product_id,
                sku: lineItem.sku,
                quantity: currernt_quantity,
                image: product.data.product.image !== null && product.data.product.image.src !== null ? product.data.product.image.src : "null",
                location: product.data.product.variants[0].inventory_item_id,
                completionStatus: p.completionStatus
            });
    
        }
        const data = {
            orderNo : order.orderNo,
            productStatus : products,
            paymentStatus: order.paymentStatus,
            fulfilledOn: order.fulfilledOn, 
            skipReason: order.skipReason ? order.skipReason : null
        }
    
        res.status(200).json(data);
    }
    else{
        res.status(200).json(order);
    }

});



router.post("/search", async (req, res) => {
    console.log("Request to /search with body:", req.body);
    const orderNo = req.body.orderNo;
    let order : any;
    if (orderNo.length === 9) {
        order = await Order.findOne({ bagId: orderNo });
    }else {
        order = await Order.findOne({ orderNo: orderNo });
    }
    
    if(!order) {
        return res.status(400).json({ message: "Invalid order number" });
    }
    
    if (order.fulfilledOn === "null" && order.status === "pending") {
        return res.status(200).json({pending : true , skipped : false , orderNo : order.orderNo});

    }
    else if (order.fulfilledOn === "null" && order.status === "skipped") {
        return res.status(200).json({pending : true , skipped : true , orderNo : order.orderNo});
    }
    else{
        return res.status(200).json({pending : false , orderNo : order.orderNo});
    }
})



export default router;
