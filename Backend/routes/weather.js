const app = require("express").Router();

// WMO weather codes -> simple readable text
const weatherCodeMap = {
  0: "Clear",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Violent Showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

const getCondition = (code) => weatherCodeMap[code] || "Clouds";

const fetchFromOpenMeteo = async (baseUrl, lat, lon, date) => {
  const url = `${baseUrl}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weather_code,wind_speed_10m_max,sunset&timezone=auto&start_date=${date}&end_date=${date}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.daily || !data.daily.time || data.daily.time.length === 0) {
    throw new Error("No weather data for this date");
  }

  const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    temperature: Math.round(data.daily.temperature_2m_max[0]),
    condition: getCondition(data.daily.weather_code[0]),
    windSpeed: Math.round(data.daily.wind_speed_10m_max[0] * 0.621371), // km/h -> mph
    sunset: sunsetTime,
  };
};

// Get weather for a specific date - tries the forecast API first (covers ~92 days
// back to 16 days ahead), then falls back to the historical archive for older dates
app.get("/", async (req, res) => {
  try {
    const { lat, lon, date } = req.query;
    const selectedDate = date || new Date().toISOString().split("T")[0];

    let weatherData;

    try {
      weatherData = await fetchFromOpenMeteo(
        "https://api.open-meteo.com/v1/forecast",
        lat,
        lon,
        selectedDate
      );
    } catch (forecastError) {
      weatherData = await fetchFromOpenMeteo(
        "https://archive-api.open-meteo.com/v1/archive",
        lat,
        lon,
        selectedDate
      );
    }

    res.json(weatherData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching weather" });
  }
});

module.exports = app;