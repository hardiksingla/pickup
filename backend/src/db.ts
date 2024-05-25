import mongoose from "mongoose";
import { number } from "zod";
import dotenv from "dotenv";

dotenv.config();
// const MONGODB_URI : any = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb+srv://hardiksingla007:k6GxsfWvs6QaojIs@cluster0.otp7pa7.mongodb.net/pickup?retryWrites=true&w=majority&appName=Cluster0"
      "mongodb+srv://07hardiksingla:ptGG2BEXxTry4H2C@cluster0.dkqwq2p.mongodb.net/pickuptest?retryWrites=true&w=majority&appName=Cluster0"
      // "mongodb://localhost:27016/pickup"
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
  },
  prepaid:{
    type: Boolean
  },
  bagId: {
    type: String,
  },
  // skipReason:{
  //   type: String
  // }
  
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
