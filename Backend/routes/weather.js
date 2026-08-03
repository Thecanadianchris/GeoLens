const app = require("express").Router();

app.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Error fetching weather" });
    }

    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Convert wind speed from m/s to mph to match the wireframe
    const windMph = Math.round(data.wind.speed * 2.23694);

    res.json({
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      windSpeed: windMph,
      sunset: sunsetTime,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching weather" });
  }
});

module.exports = app;