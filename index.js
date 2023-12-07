const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { userRouter } = require("./Router/user.router")
const mongoose = require("mongoose")
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", userRouter)
app.get("/", (req, res) => {
    res.end("Welcome");
})

app.listen(process.env.PORT, async () => {
    try {
        const connection = await mongoose.connect(process.env.mongoURL)
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
    }
})