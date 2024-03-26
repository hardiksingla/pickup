import express from "express";
import userRouter from './user';
import orderRouter from './order';

const router = express.Router();

router.use('/user', userRouter);
router.use('/order', orderRouter);

export default router;
