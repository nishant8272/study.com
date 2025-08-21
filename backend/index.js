const express = require('express');
require('dotenv').config();
const mongoose =require("mongoose")
const cors = require('cors');
const {userRouter} = require("./user.js");
const { coursesRoute } = require("./courses.js")
const {adminRoute } = require("./admin.js");
const { contactRouter } = require("./contact.js");
const { paymentRouter } = require("./razorpay.js");
const {job} =require("./db/cron.js")

const app = express();

if(process.env.NODE_ENV==="production") job.start()

app.use(cors(
  {
  origin:"https://courseacademy-sepia.vercel.app", // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}
));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/user",userRouter);
app.use("/courses", coursesRoute);
app.use("/admin", adminRoute);
app.use("/contact", contactRouter);
app.use("/razorpay", paymentRouter);
app.get("/api/health",(req,res)=>{
 res.status(200).json({
     status: "ok"
 })
})

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

startServer();
