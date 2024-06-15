import Express from "express";
import { User , Order} from "../db";
import { appendToSheet } from "../sheetFunctions";
import dotenv from 'dotenv';
dotenv.config();

const router = Express.Router();

router.post('/update', async (req, res) => {
    const orders = await Order.find({ lablePrinted: false, status: { $in: ["completed", "manualComplete"] } });
    // console.log(orders);
    let data = [];
    let count = 1;
    let str = ""
    orders.forEach((order) => {
        count++ 
        str += order.orderNo + ','
        if (count == 500){
            str = str.slice(0, -1);
            console.log(str);
            data.push([str]);
            str = ""
            count = 1;
        }
    });
    str = str.slice(0, -1);
    data.push([str]);
    appendToSheet("16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk", "AppLabels!A1", data);

    await Order.updateMany({ lablePrinted: false, status: { $in: ["completed", "manualComplete"] } }, { lablePrinted: true })

    res.status(200).json({ status : 200 , message: "Data updated successfully" });


});

router.post("/updateSkipped", async (req, res) => {
    const orders = await Order.find({ status : "skipped" , skipExported : false });

    let data = [];

    orders.forEach((order) => {
        let orderData = [];
        orderData.push(new Date().toString());
        orderData.push(order.orderNo);
        let productString = ""
        for (let i = 0; i < order.productStatus.length; i++) {
            if (order.productStatus[i].quantity > order.productStatus[i].completionStatus) {
                productString +=  order.productStatus[i].sku + ","
            }
        }
        if (productString.length > 0) {
            productString = productString.slice(0, -1);
        }
        orderData.push(productString);
        orderData.push("");
        orderData.push("");
        orderData.push(order.skipReason);
        console.log(orderData);
        data.push(orderData);
    });
    console.log(data);
    await appendToSheet("16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk", "AppSkipped!A1", data);

    await Order.updateMany({ status : "skipped" , skipExported : false }, { skipExported : true });

    res.status(200).json({ status : 200 , message: "Data updated successfully" });

    });


export default router;



