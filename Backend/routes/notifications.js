const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { Notification, User, Photo } = require("../models/index");

// Route to get notifications
app.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Getting notifications");
    const notifications = await Notification.findAll({
      where: { toUserId: req.userId },
      include: [
        { model: User, as: "fromUser", attributes: ["id", "username", "profilePhoto"] },
        { model: Photo, attributes: ["id", "title", "imageUrl"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving notifications" });
  }
});

// Route to mark a notification as read
app.put("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.update(
      { read: true },
      { where: { id: req.params.id, toUserId: req.userId } }
    );

    res.json(notification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating notification" });
  }
});

// Route to delete a notification
app.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.destroy({
      where: { id: req.params.id, toUserId: req.userId },
    });

    res.json(notification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting notification" });
  }
});

module.exports = app;