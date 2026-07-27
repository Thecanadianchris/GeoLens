require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/connection");
const authRoutes = require("./routes/auth");




const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);



const PORT = process.env.PORT || 3000;

