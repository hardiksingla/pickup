import rootRouter from "./routes/index";
import cors from "cors";
import express from "express";

const corsOptions = {
  origin: "*"
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/v1", rootRouter);
