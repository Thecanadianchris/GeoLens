const app = require("express").Router();
const multer = require("multer");
const path = require("path");
const { Op } = require("sequelize");
const verifyToken = require("../middleware/auth");
const supabase = require("../config/supabase");
const { Photo, User } = require("../models/index");

// Keep the uploaded file in memory so we can send it to Supabase
const upload = multer({ storage: multer.memoryStorage() });

// Route to add a new photo
app.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, description, location, category, cameraDetails, weatherCondition, weatherRating, latitude, longitude } = req.body;

    // Upload the image to Supabase Storage
    const fileName = Date.now() + path.extname(req.file.originalname);

    const { error } = await supabase.storage
      .from("photos")
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Error uploading image" });
    }

    // Get the public link for the image
    const { data } = supabase.storage.from("photos").getPublicUrl(fileName);

    const photo = await Photo.create({
      title,
      description,
      location,
      category,
      cameraDetails,
      weatherCondition,
      weatherRating,
      latitude,
      longitude,
      imageUrl: data.publicUrl,
      userId: req.userId,
    });

    res.status(201).json(photo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding photo" });
  }
});

// Route to get all photos, with search and filters
app.get("/", async (req, res) => {
  try {
    const { search, category, location, weather } = req.query;
    const where = {};

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (weather) {
      where.weatherCondition = weather;
    }

    console.log("Getting all photos");
    const photos = await Photo.findAll({
      where,
      include: [{ model: User, attributes: ["id", "username"] }],
    });

    res.json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving photos" });
  }
});

// Route to get nearby photos
app.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Look for photos within roughly 10 miles
    const range = 0.15;

    const photos = await Photo.findAll({
      where: {
        latitude: { [Op.between]: [Number(latitude) - range, Number(latitude) + range] },
        longitude: { [Op.between]: [Number(longitude) - range, Number(longitude) + range] },
      },
      include: [{ model: User, attributes: ["id", "username"] }],
    });

    res.json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving nearby photos" });
  }
});

// Route to get one photo
app.get("/:id", async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["id", "username", "profilePhoto"] }],
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json(photo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving photo" });
  }
});

// Route to update a photo
app.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, location, category, cameraDetails, weatherCondition, weatherRating } = req.body;

    const photo = await Photo.update(
      { title, description, location, category, cameraDetails, weatherCondition, weatherRating },
      { where: { id: req.params.id, userId: req.userId } }
    );

    res.json(photo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting photo" });
  }
});

// Route to delete a photo
app.delete("/:id", verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Remove the image from Supabase Storage
    const fileName = photo.imageUrl.split("/").pop();
    await supabase.storage.from("photos").remove([fileName]);

    await photo.destroy();

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting photo" });
  }
});

module.exports = app;