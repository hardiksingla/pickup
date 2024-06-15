import mongoose from "mongoose";
import { number, string } from "zod";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI : string = process.env.MONGODB_URI as string;

const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGODB_URI
      // "mongodb+srv://hardiksingla007:k6GxsfWvs6QaojIs@cluster0.otp7pa7.mongodb.net/pickupV3?retryWrites=true&w=majority&appName=Cluster0"
      // "mongodb+srv://07hardiksingla:ptGG2BEXxTry4H2C@cluster0.dkqwq2p.mongodb.net/pickuptest?retryWrites=true&w=majority&appName=Cluster0"
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
  skipReason: {
    type: String
  },
  productStatus: {
    type: Array
  },
  fulfilledOn : {
    type : String,
    required : true
  },
  fulfilledBy : {
    type : String
  },
  fulfillmentTime: {  
    type : Date
  },
  orderedAt: {
    type : Date,
    // required : true
  },
  labelPrinted : {
    type : Boolean
  },
  skipExported : {
    type : Boolean
  },
  assignedTo : {
    type : String
  }
  
});
const variableSchema = new mongoose.Schema({
  startId : {
    type : Number  
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
  },
  completionStatus: {
    type: Number,
    required: true,
  }
});

export const User = mongoose.model("User", UserSchema);
export const Order = mongoose.model("Order", ordersSchema);
export const ProductOrdered = mongoose.model("ProductOrdered" , ProductOrderedSchema);
export const Product = mongoose.model("Product", productShema);
export const Variable = mongoose.model("Variable", variableSchema);

Order.init().catch(err => console.error('Index creation error:', err));

// export = {
//   Order,
//   ProductOrdered,
//   Product
// }
