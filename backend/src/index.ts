import rootRouter from "./routes/index";
import cors from "cors";
import express from "express";
import path from "path";


const corsOptions = {
  origin: "*"
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const __dirname1 = path.resolve();
console.log("17", path.resolve(__dirname, "../../frontend", "dist", "index.html"))

if (true) {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  
  app.get("/api/healthcheck", function(req,res){
    res.json({ status: 'ok' })
  
  })
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../../frontend", "dist", "index.html"))
  );  
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/v1", rootRouter);
