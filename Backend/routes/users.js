const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { User, Photo } = require("../models/index");

// Route to get a user profile
app.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "username", "profilePhoto", "title", "location", "bio", "createdAt"],
      include: [{ model: Photo }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving user" });
  }
});

// Route to get a user's photos
app.get("/:id/photos", async (req, res) => {
  try {
    console.log("Getting user photos");
    const photos = await Photo.findAll({
      where: { userId: req.params.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving photos" });
  }
});

// Route to update my profile
app.put("/:id", verifyToken, async (req, res) => {
  try {
    const { username, profilePhoto, title, location, bio } = req.body;

    const user = await User.update(
      { username, profilePhoto, title, location, bio },
      { where: { id: req.userId } }
    );

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

module.exports = app;