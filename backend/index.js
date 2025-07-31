const express = require('express');
require('dotenv').config();
const mongoose =require("mongoose")
const cors = require('cors');
const {userRouter} = require("./user.js");
const { coursesRoute } = require("./courses.js")
const {adminRoute } = require("./admin.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user",userRouter);
app.use("/courses", coursesRoute);
app.use("/admin", adminRoute);


async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

startServer();
