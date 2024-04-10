import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req : any , res : any, next :any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded : any = jwt.verify(token, JWT_SECRET as string);
        req.phoneNumber = decoded.phoneNumber;
        console.log("decoded",req.phoneNumber, decoded.phoneNumber,decoded);
        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

export { authMiddleware };  