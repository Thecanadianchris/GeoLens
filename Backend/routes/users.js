const app = require("express").Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/auth");
const supabase = require("../config/supabase");
const { User, Photo } = require("../models/index");

const upload = multer({ storage: multer.memoryStorage() });

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
app.put("/:id", verifyToken, upload.single("profilePhoto"), async (req, res) => {
  try {
    const { username, title, location, bio } = req.body;

    let profilePhotoUrl;

    if (req.file) {
      const fileName = Date.now() + path.extname(req.file.originalname);

      const { error } = await supabase.storage
        .from("photos")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Error uploading profile photo" });
      }

      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
      profilePhotoUrl = data.publicUrl;
    }

    const updateData = { username, title, location, bio };
    if (profilePhotoUrl) {
      updateData.profilePhoto = profilePhotoUrl;
    }

    await User.update(updateData, { where: { id: req.userId } });

    const user = await User.findByPk(req.userId, {
      attributes: ["id", "username", "profilePhoto", "title", "location", "bio", "createdAt"],
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

module.exports = app;