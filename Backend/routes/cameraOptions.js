const app = require("express").Router();
const { CameraOption } = require("../models/index");

const defaultLensOptions = [
  "Sony A7 IV · 24-70mm",
  "Canon R5 · 24-105mm",
  "Nikon Z6 II · 24-70mm",
  "iPhone 15 Pro",
  "Fujifilm X-T5 · 18-55mm",
];

const defaultSettingsOptions = [
  "f/8 · 1/125 · ISO 100",
  "f/11 · 1/250 · ISO 200",
  "f/2.8 · 1/500 · ISO 400",
  "f/16 · 1/60 · ISO 100",
];

// Get all lens options (built-in defaults + any custom ones added)
app.get("/lens", async (req, res) => {
  try {
    const custom = await CameraOption.findAll({ where: { type: "lens" } });
    const customValues = custom.map((option) => option.value);
    res.json([...new Set([...defaultLensOptions, ...customValues])]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving lens options" });
  }
});

// Get all settings options (built-in defaults + any custom ones added)
app.get("/settings", async (req, res) => {
  try {
    const custom = await CameraOption.findAll({ where: { type: "settings" } });
    const customValues = custom.map((option) => option.value);
    res.json([...new Set([...defaultSettingsOptions, ...customValues])]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving settings options" });
  }
});

// Add a new custom option (lens or settings)
app.post("/", async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({ error: "type and value are required" });
    }

    const [option] = await CameraOption.findOrCreate({ where: { type, value } });
    res.status(201).json(option);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding option" });
  }
});

module.exports = app;