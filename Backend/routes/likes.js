const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { Like, Photo, Notification } = require("../models/index");

// Route to like a photo
app.post("/", verifyToken, async (req, res) => {
  try {
    const { photoId } = req.body;

// Stop the same user liking twice
    const existingLike = await Like.findOne({
      where: { photoId, userId: req.userId },
    });

    if (existingLike) {
      return res.status(400).json({ error: "You already liked this photo" });
    }

    const like = await Like.create({
      photoId,
      userId: req.userId,
    });

// Send a notification to the photo owner
    const photo = await Photo.findByPk(photoId);

    if (photo.userId !== req.userId) {
      await Notification.create({
        type: "like",
        fromUserId: req.userId,
        toUserId: photo.userId,
        photoId,
      });
    }

    res.status(201).json(like);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error liking photo" });
  }
});

// Route to get all likes for a photo
app.get("/photo/:photoId", async (req, res) => {
  try {
    console.log("Getting likes");
    const likes = await Like.findAll({ where: { photoId: req.params.photoId } });
    res.json(likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving likes" });
  }
});

// Route to unlike a photo
app.delete("/:photoId", verifyToken, async (req, res) => {
  try {
    const like = await Like.destroy({
      where: { photoId: req.params.photoId, userId: req.userId },
    });

    res.json(like);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error unliking photo" });
  }
});

module.exports = app;