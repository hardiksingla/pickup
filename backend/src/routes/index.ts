import express from "express";
import userRouter from './user';
import orderRouter from './order';
import sheetsRouter from './sheets';

const router = express.Router();

router.use('/user', userRouter);
router.use('/order', orderRouter);
router.use('/sheets', sheetsRouter);

export default router;
