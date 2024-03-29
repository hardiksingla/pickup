import Express from "express";
import zod from "zod";
import { User , Order, ProductOrdered, Product} from "../db";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = Express.Router();

const loginZod = zod.object({
    phoneNumber : zod.string().refine((value) => /^\d{10}$/.test(value)),
    password : zod.string()
});

router.post('/login', async (req, res) => {
    const validationResult : boolean = loginZod.safeParse(req.body).success;
    if (!validationResult){
        res.status(400).json({ message: "Invalid request" });
        return
    }
    const {phoneNumber, password} = req.body;
    const user = await User.findOne({ phoneNumber : phoneNumber, password : password });
    if (user){
        res.status(200).json({ token : jwt.sign({ userID : user._id}, JWT_SECRET as string) });
    }
    else{
        res.status(401).json({ message: "Invalid credentials" });
    }


});

export default router;



