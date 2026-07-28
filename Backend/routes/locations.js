const app = require("express").Router();
const { Op } = require("sequelize");
const verifyToken = require("../middleware/auth");
const { Location, Photo, SavedLocation } = require("../models/index");

// Route to add a new location
app.post("/", verifyToken, async (req, res) => {
  try {
    const { name, county, category, description, latitude, longitude, photographyScore, rating } = req.body;

    const location = await Location.create({
      name,
      county,
      category,
      description,
      latitude,
      longitude,
      photographyScore,
      rating,
    });

    res.status(201).json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding location" });
  }
});




// Route to get all locations, with search and filters
app.get("/", async (req, res) => {
  try {
    const { search, county, category, sort } = req.query;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (county) {
      where.county = county;
    }

    if (category) {
      where.category = category;
    }




// Sort by rating or newest, default is rating
    let order = [["rating", "DESC"]];

    if (sort === "newest") {
      order = [["createdAt", "DESC"]];
    }

    console.log("Getting all locations");
    const locations = await Location.findAll({ where, order });

    res.json(locations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving locations" });
  }
});



// Route to get nearby locations
app.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Look for locations within roughly 10 miles
    const range = 0.15;

    const locations = await Location.findAll({
      where: {
        latitude: { [Op.between]: [Number(latitude) - range, Number(latitude) + range] },
        longitude: { [Op.between]: [Number(longitude) - range, Number(longitude) + range] },
      },
    });

    res.json(locations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving nearby locations" });
  }
});



// Route to get my saved locations
app.get("/saved", verifyToken, async (req, res) => {
  try {
    console.log("Getting saved locations");
    const saved = await SavedLocation.findAll({
      where: { userId: req.userId },
      include: [{ model: Location }],
    });

    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving saved locations" });
  }
});



// Route to get one location with its photos
app.get("/:id", async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id, {
      include: [{ model: Photo }],
    });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving location" });
  }
});




// Route to save a location
app.post("/:id/save", verifyToken, async (req, res) => {
  try {
    // Stop the same location being saved twice
    const existingSave = await SavedLocation.findOne({
      where: { locationId: req.params.id, userId: req.userId },
    });

    if (existingSave) {
      return res.status(400).json({ error: "You already saved this location" });
    }

    const saved = await SavedLocation.create({
      locationId: req.params.id,
      userId: req.userId,
    });

    res.status(201).json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving location" });
  }
});




// Route to unsave a location
app.delete("/:id/save", verifyToken, async (req, res) => {
  try {
    const saved = await SavedLocation.destroy({
      where: { locationId: req.params.id, userId: req.userId },
    });

    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error unsaving location" });
  }
});



module.exports = app;