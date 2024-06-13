import Express from "express";
import zod from "zod";
import axios from "axios";
import { User , Order, ProductOrdered, Product} from "../db";
import dotenv from 'dotenv';
import { authMiddleware } from "../middleware";
import { skip } from "node:test";
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
    // console.log(req.body.from , req.body.to , req.phoneNumber , req.body.orderType);
    console.log(req.body);

    const update = {
        $set: {
            status: req.phoneNumber
        }
    };    
    const options = {
        new: true,
        runValidators: true
    };
    
    
    let query: any = {
        status: req.phoneNumber,
        orderNo: {
        $gte: req.body.from,
        $lte: req.body.to
        }
    };
    let order : any = {};
    if (req.body.orderType === "Prepaid" || req.body.orderType === "Postpaid" || req.body.orderType === "Both") {
        query.fulfilledOn = "null";
        
        // unassigned orders

        let assignedOrders = await Order.findOne({status: req.phoneNumber});
        // console.log("assignedOrders",assignedOrders);
        if (assignedOrders){    
            assignedOrders.status = "pending";
            await assignedOrders.save();
        }

        if (req.body.yesterday == 'true') {
            const now = new Date(); 
            const yesterday = new Date(now);
            yesterday.setHours(0, 0, 0, 0); 
            console.log("yesterdayMidnight",yesterday.toISOString());
            query.orderedAt = { $lt : yesterday.toISOString() }
            
        }
        if (req.body.orderType === "Prepaid") {
            query.prepaid = true;
        } else if (req.body.orderType === "Postpaid") {
            query.prepaid = false;
        }
        console.log("query",query);
        order = await Order.findOneAndUpdate(query, update, options);
        if (!order){
            query.status = "pending";    
            console.log("query2",query);
            order = await Order.findOneAndUpdate(query, update, options);
        }
        if (!order){
            res.status(200).json({message : "No pending orders" , messageStatus: 0});
            return;
        }
        // console.log("order",order);
        console.log(query);
    }
    else if (req.body.orderType === "Skipped") {    
        query.status = "skipped";
        console.log("query",query);
        order = await Order.findOne(query);
        if (!order){
            res.status(200).json({message : "No skipped orders" , messageStatus: 0});
            return;
        }
    }
    else{
        console.log("Invalid order type");
         return res.status(400).json({ message: "Invalid order type" });
    }      
    
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
        orderId : order.orderNo,
        products : products,
        paymentStatus: order.paymentStatus,
        skipReason: order.skipReason ? order.skipReason : null
    }
    // console.log(order.skipReason);
    
    // console.log("final data",data);

    res.status(200).json(data);
})


// product db not required
// router.get("/updateProducts", async (req, res) => {
//     const response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/2024-01/products.json`)
//     const prevProducts = await Product.find({});
//     const prevProductsList = [];
//     for (const product of prevProducts){ 
//         prevProductsList.push(product.id);
//     }
//     console.log(prevProductsList);
//     for (const product of response.data.products){
//         console.log(product.id);
//         if (!prevProductsList.includes(product.id.toString())){
//             const newProduct = new Product({
//                 id: product.id,
//                 name: product.title,
//                 sku: product.variants[0].sku,
//                 location: product.variants[0].inventory_item_id,
//                 image: product.image !== null && product.image.src !== null ? product.image.src : "null"
//             });
//             await newProduct.save();
//         }
//     }
//     res.status(200).json({status : "success"});
    
// });

router.post("/updateOrders", async (req, res) => {
    console.log("updateOrders");


    // let deleteArr = [];
    // deleteArr.push("pending")
    // const users = await User.find({})
    // for (const user of users){
    //     deleteArr.push(user.phoneNumber);
    // }
    // console.log(deleteArr)
    // try {
    //     const result = await Order.deleteMany({ "status": { $in: deleteArr }});
    //     console.log(result.deletedCount + ' pending orders were deleted.');
    // } catch (error) {
    //     console.error('Error deleting pending orders:', error);
    // }

    
    let moreOrders = true;
    const startOrderNo = req.body.from? req.body.from : 8000;
    const r =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders.json?name=${startOrderNo}&status=any`)
    let nextid = r.data.orders[0].id;
    
    
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
                    let productArr = [];
                    for (const lineItem of order.line_items){
                        let productD = {
                            orderId: order.order_number,
                            productId: lineItem.product_id,
                            quantity: lineItem.quantity,
                            completionStatus : 0
                        }
                        // const productOrdered = new ProductOrdered(productD);
                        // await productOrdered.save();
                        productArr.push(productD);
                    }
                    const newOrder = new Order({
                        id : order.id,
                        orderNo: order.order_number,
                        status: "pending",
                        paymentStatus: paymentStatus,
                        prepaid: order.financial_status === "paid" ? true : false,
                        productStatus : productArr,
                        createdAt : new Date()

                    });
                    await newOrder.save();
                    
                }
            }
        }
    }
    res.status(200).json({status : "success"});
})


router.post("/updateOrders2", async (req, res) => {
    console.log("updateOrders2");    
    let moreOrders = true;
    const startOrderNo = req.body.from? req.body.from : 11000;
    const r =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders.json?name=${startOrderNo}&status=any`)
    let nextid = r.data.orders[0].id;
    
    const prevOrders = await Order.find({});

    const prevOrdersList = [];
    for (const order of prevOrders){ 
        prevOrdersList.push(order.orderNo);
    }
    console.log(prevOrdersList);
    
    while (moreOrders){
        let response : any;
        response =  await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/orders.json?limit=250&since_id=${nextid}&status=any`)
        if (response.data.orders.length === 0){
            moreOrders = false;
        }else{
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
                let lablePrinted = false;
                if (order.fulfillment_status === "fulfilled") {
                    fulfilledOn = "shopify";
                    lablePrinted = true;
                }
                if (order.cancelled_at !== null){
                    console.log(order.cancelled_at);
                    console.log("cancelled added to mongo");
                    lablePrinted = true;
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
                    lablePrinted: lablePrinted,
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
                    await orderM.save();
                }

                else if(orderM.fulfilledOn === "null" && order.fulfillment_status === "fulfilled"){
                    orderM.fulfilledOn = "shopify";
                    await orderM.save();
                }
                // else if (orderM.status !== "skipped" && orderM.status !== "completed" && order.fullfilmentStatus === "fullfilled"){
                //     orderM.fulfilledOn = "shopify";
                //     await orderM.save();
                // }
                // else if (orderM.fulfilledOn === "null" && order.fullfilmentStatus !== "fullfilled"){
                //     orderM.fulfilledOn = "null";
                //     await orderM.save();
                // }
                
            
            }
        }
    }
    res.status(200).json({status : "success"});
})


router.post('/submit', authMiddleware ,  async (req, res) => {
    const validationResult : any = productSubmitZod.safeParse(req.body);
    // console.log("vlaidation error " ,validationResult.error);
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
    order.status = status ;
    order.bagId = req.body.bagId;
    order.skipReason = req.body.comment;
    order.productStatus = req.body.products;
    order.fulfilledOn = status === "skipped" ? "null" : "app";
    
    order.fulfilledBy = req.phoneNumber;
    order.fulfillmentTime = new Date();
    await order.save();

    res.status(200).json({ message: "Order updated" , status:1});
});


router.post('/getskipped', async (req, res) => {
    console.log("Request to /getskipped with body:", req.body);
    
    const order = await Order.findOne({ orderNo : req.body.orderNo });
    if (!order){
        return res.status(400).json({ message: "Invalid order number" });
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
        // console.log(order.skipReason);
        
        // console.log("final data",data);
    
        res.status(200).json(data);
    }
    else{
        res.status(200).json(order);
    }

});



router.post("/search", async (req, res) => {
    console.log("Request to /search with body:", req.body);
    const orderNo = req.body.orderNo;
    const order = await Order.findOne({ orderNo: orderNo });
    
    if(!order) {
        return res.status(400).json({ message: "Invalid order number" });
    }
    
    if (order.fulfilledOn === "null" && order.status === "pending") {
        return res.status(200).json({pending : true , skipped : false});

    }
    else if (order.fulfilledOn === "null" && order.status === "skipped") {
        return res.status(200).json({pending : true , skipped : true});
    }
    else{
        return res.status(200).json({pending : false});
    }
})



export default router;
