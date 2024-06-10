import Express from "express";
import zod from "zod";
import axios from "axios";
import { User , Order, ProductOrdered, Product} from "../db";
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
    status: zod.enum(["completed", "skipped"])
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
        console.log("assignedOrders",assignedOrders);
        if (assignedOrders){    
            assignedOrders.status = "pending";
            await assignedOrders.save();
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
        console.log("order",order);
        console.log(query);
    }
    else if (req.body.orderType === "Skipped") {
        query.fulfilledOn = "app";
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
    console.log("orderId",order);
    // return res.status(400).json({ message: "Invalid order type" });
    
    const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/orders/${orderId}.json`);

    // console.log("order",order,"order");
    const lineItems = orderDetails.data.order.line_items;

    // Fetch product details and prepare the products list
    for (const lineItem of lineItems) {
        const productId = lineItem.product_id;
        if (productId === null) {
            continue;
        }

        const product = await axios.get(`https://${SHOPIFY_API_KEY}/admin/api/2024-04/products/${productId}.json`);
        const currernt_quantity = lineItem.current_quantity;

        const p = (order.productStatus).find((product) => {
            // console.log("product",product , lineItem.product_id);
            return product.productId == lineItem.product_id
        });
        // console.log("p",p);

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
    console.log(order.skipReason);
    
    console.log("final data",data);

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
    const startOrderNo = req.body.from? req.body.from : 8000;
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
                if (order.cancelled_at !== null){
                    console.log(order.cancelled_at);
                    console.log("cancelled not in mongo");
                    continue;
                }
                
                const paymentStatus = Array.isArray(order.payment_gateway_names) && order.payment_gateway_names.length > 0
                                    ? order.payment_gateway_names[0]
                                    : 'Unknown Payment Status';
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

                let fulfilledOn = "null";
                if (order.fulfillment_status === "fulfilled") {
                    fulfilledOn = "shopify";
                }

                const newOrder = new Order({
                    id : order.id,
                    orderNo: order.order_number,
                    status: "pending",
                    paymentStatus: paymentStatus,
                    prepaid: order.financial_status === "paid" || order.financial_status === "partially_refunded" || order.financial_status === "partially_paid" ? true : false,
                    productStatus : productArr,
                    fulfilledOn : fulfilledOn,
                    orderedAt : order.created_at
                });
                await newOrder.save();
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
    order.status = status === "completed" ? "completed" : "skipped";
    order.bagId = req.body.bagId;
    order.skipReason = req.body.comment;
    order.productStatus = req.body.products;
    order.fulfilledOn = "app";
    
    order.fulfilledBy = req.phoneNumber;
    order.fulfillmentTime = new Date();
    await order.save();

    res.status(200).json({ message: "Order updated" , status:1});
});


router.post('/getskipped', async (req, res) => {
    console.log("Request to /getskipped with body:", req.body);
    
    try {
        let deleteArr = ["pending", "completed"];
        const users = await User.find({});
        for (const user of users){
            deleteArr.push(user.phoneNumber);
        }
        console.log("Delete array:", deleteArr);
        
        let skipped : any;
        if (req.body.next) {
            skipped = await Order.findOne({
                "status": { "$nin": deleteArr },
                "orderNo": { "$gt": req.body.orderNo }
            });
        } else {
            skipped = await Order.find({
                "status": { "$nin": deleteArr },
                "orderNo": { "$lt": req.body.orderNo }
            }).sort({ orderNo: -1 }).limit(1);
            skipped = skipped.length > 0 ? skipped[0] : null;
            console.log("Previous skipped order:", skipped);
        }
        
        if (!skipped) {
            console.log("No skipped orders found based on the provided orderNo. Fetching the first available skipped order.");
            skipped = await Order.findOne({
                "status": { "$nin": deleteArr },
                "orderNo": { "$gt": 0 }
            });
            if (!skipped) {
                console.log("No skipped orders available.");
                return res.status(200).json({ message: "No skipped orders" });
            }
        }

        if (skipped.productStatus.length === 0) {
            let products : any = [];
            const orderId = skipped.id;
            const orderDetails = await axios.get(`https://${SHOPIFY_API_KEY}/admin/orders/${orderId}.json`);
        
        
            const lineItems = orderDetails.data.order.line_items;
            const refunds = orderDetails.data.order.refunds;
        
            // Create a map to store updated quantities of each product
            const updatedQuantities = {};
        
            // Initialize quantities from line items
            for (const lineItem of lineItems) {
                const productId = lineItem.product_id;
                if (productId === null) {
                    continue;
                }
                if (!updatedQuantities[productId]) {
                    updatedQuantities[productId] = lineItem.quantity;
                } else {
                    updatedQuantities[productId] += lineItem.quantity;
                }
            }
        
            // Adjust quantities based on refunds
            for (const refund of refunds) {
                for (const refundLineItem of refund.refund_line_items) {
                    const refundedProductId = refundLineItem.line_item_id;
                    const lineItem = lineItems.find(item => item.id === refundedProductId);
                    if (lineItem && updatedQuantities[lineItem.product_id] !== undefined) {
                        updatedQuantities[lineItem.product_id] -= refundLineItem.quantity;
                    }
                }
            }
        
            // Fetch product details and prepare the products list
            for (const lineItem of lineItems) {
                const productId = lineItem.product_id;
                if (productId === null) {
                    continue;
                }
        
                const product = await axios.get(`https://${SHOPIFY_API_KEY}/admin/products/${productId}.json`);
                const quantity = updatedQuantities[productId] !== undefined ? updatedQuantities[productId] : lineItem.quantity;
        
                products.push({
                    name: product.data.product.title,
                    sku: lineItem.sku,
                    quantity: quantity,
                    image: product.data.product.image !== null && product.data.product.image.src !== null ? product.data.product.image.src : "null",
                    location: product.data.product.variants[0].inventory_item_id,
                    completionStatus: 0
                });
        
            }
            skipped = {
                orderNo : skipped.orderNo,
                productStatus : products,
                paymentStatus: skipped.paymentStatus,
                status: skipped.status
            }
        }
        
        console.log("Skipped order found:", skipped);
        res.status(200).json({ message: "Skipped order found", skipped: skipped });

    } catch (error) {
        console.error("Error in /getskipped route:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});





export default router;
