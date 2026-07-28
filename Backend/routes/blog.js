const app = require("express").Router();
const verifyToken = require("../middleware/auth");
const { Blog, Photo, User } = require("../models/index");

// Route to add a blog post
app.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content, excerpt, photoId } = req.body;

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      photoId,
      userId: req.userId,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding blog post" });
  }
});

// Route to get all blog posts
app.get("/", async (req, res) => {
  try {
    console.log("Getting all blog posts");
    const blogs = await Blog.findAll({
      include: [
        { model: User, attributes: ["id", "username"] },
        { model: Photo, attributes: ["id", "imageUrl", "location"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(blogs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving blog posts" });
  }
});

// Route to get one blog post
app.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["id", "username", "profilePhoto"] },
        { model: Photo },
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving blog post" });
  }
});

// Route to update a blog post
app.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, content, excerpt } = req.body;

    const blog = await Blog.update(
      { title, content, excerpt },
      { where: { id: req.params.id, userId: req.userId } }
    );

    res.json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating blog post" });
  }
});

// Route to delete a blog post
app.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.destroy({
      where: { id: req.params.id, userId: req.userId },
    });

    res.json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting blog post" });
  }
});

module.exports = app;