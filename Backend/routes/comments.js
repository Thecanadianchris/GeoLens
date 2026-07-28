const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { Comment, Photo, User, Notification } = require("../models/index");

// Route to add a comment
app.post("/", verifyToken, async (req, res) => {
  try {
    const { content, photoId } = req.body;

    const comment = await Comment.create({
      content,
      photoId,
      userId: req.userId,
    });

// Send a notification to the photo owner
    const photo = await Photo.findByPk(photoId);

    if (photo.userId !== req.userId) {
      await Notification.create({
        type: "comment",
        fromUserId: req.userId,
        toUserId: photo.userId,
        photoId,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding comment" });
  }
});

// Route to get all comments for a photo
app.get("/photo/:photoId", async (req, res) => {
  try {
    console.log("Getting comments");
    const comments = await Comment.findAll({
      where: { photoId: req.params.photoId },
      include: [{ model: User, attributes: ["id", "username", "profilePhoto"] }],
    });

    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving comments" });
  }
});

// Route to delete a comment
app.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.destroy({
      where: { id: req.params.id, userId: req.userId },
    });

    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting comment" });
  }
});

module.exports = app;