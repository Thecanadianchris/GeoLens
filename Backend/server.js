require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/connection");
const authRoutes = require("./routes/auth");
const photoRoutes = require("./routes/photos");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");
const followRoutes = require("./routes/follow");
const savedRoutes = require("./routes/saved");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const blogRoutes = require("./routes/blog");
const locationRoutes = require("./routes/locations");
const weatherRoutes = require("./routes/weather");
const cameraOptionRoutes = require("./routes/cameraOptions");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/camera-options", cameraOptionRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});