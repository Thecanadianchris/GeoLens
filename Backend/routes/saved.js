const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { SavedPhoto, Photo, User } = require("../models/index");

// Route to save a photo
app.post("/:photoId", verifyToken, async (req, res) => {
  try {
    // Stop the same photo being saved twice
    const existingSave = await SavedPhoto.findOne({
      where: { photoId: req.params.photoId, userId: req.userId },
    });

    if (existingSave) {
      return res.status(400).json({ error: "You already saved this photo" });
    }

    const saved = await SavedPhoto.create({
      photoId: req.params.photoId,
      userId: req.userId,
    });

    res.status(201).json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving photo" });
  }
});

// Route to unsave a photo
app.delete("/:photoId", verifyToken, async (req, res) => {
  try {
    const saved = await SavedPhoto.destroy({
      where: { photoId: req.params.photoId, userId: req.userId },
    });

    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error unsaving photo" });
  }
});

// Route to get saved photos
app.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Getting saved photos");
    const saved = await SavedPhoto.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Photo,
          include: [{ model: User, attributes: ["id", "username"] }],
        },
      ],
    });

    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving saved photos" });
  }
});

module.exports = app;