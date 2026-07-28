const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { Follow, User, Notification } = require("../models/index");



// Route to follow a user
app.post("/:id", verifyToken, async (req, res) => {
  try {
    // Stop the same user following twice
    const existingFollow = await Follow.findOne({
      where: { followerId: req.userId, followingId: req.params.id },
    });

    if (existingFollow) {
      return res.status(400).json({ error: "You already follow this user" });
    }

    const follow = await Follow.create({
      followerId: req.userId,
      followingId: req.params.id,
    });



// Send a notification to the user being followed
    await Notification.create({
      type: "follow",
      fromUserId: req.userId,
      toUserId: req.params.id,
    });

    res.status(201).json(follow);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error following user" });
  }
});


// Route to unfollow a user
app.delete("/:id", verifyToken, async (req, res) => {
  try {
    const follow = await Follow.destroy({
      where: { followerId: req.userId, followingId: req.params.id },
    });

    res.json(follow);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error unfollowing user" });
  }
});



// Route to get a user's followers
app.get("/followers/:id", async (req, res) => {
  try {
    console.log("Getting followers");
    const followers = await Follow.findAll({
      where: { followingId: req.params.id },
      include: [{ model: User, as: "follower", attributes: ["id", "username", "profilePhoto"] }],
    });

    res.json(followers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving followers" });
  }
});



// Route to get who a user is following
app.get("/following/:id", async (req, res) => {
  try {
    console.log("Getting following");
    const following = await Follow.findAll({
      where: { followerId: req.params.id },
      include: [{ model: User, as: "followingUser", attributes: ["id", "username", "profilePhoto"] }],
    });

    res.json(following);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving following" });
  }
});



module.exports = app;