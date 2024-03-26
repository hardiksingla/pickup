import mongoose from "mongoose";
import { number } from "zod";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI : any = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGODB_URI
    );
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAIL", error);
    process.exit(1);
  }
};
connectDB();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const ordersSchema = new mongoose.Schema({
  id : {
    type : String,
    required : true,
    unique : true
  },
  orderNo: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
  },
  paymentStatus : {
    type : String
  }
});

const productShema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    requied: true,
  },
  sku: {
    type: String,
  },
  location: {
    type: String,
  },
  image : {
    type : String
  }
});

const ProductOrderedSchema = new mongoose.Schema({
  orderId : {
    type: Number,
  },
  productId : {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  }
});

export const User = mongoose.model("User", UserSchema);
export const Order = mongoose.model("Order", ordersSchema);
export const ProductOrdered = mongoose.model("ProductOrdered" , ProductOrderedSchema);
export const Product = mongoose.model("Product", productShema);


// export = {
//   Order,
//   ProductOrdered,
//   Product
// }
