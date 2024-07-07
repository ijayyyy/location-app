require('dotenv').config();
const express = require("express");
const axios = require("axios");

const app = express();

const port = process.env.PORT || 4000;

app.get("/api/hello", async (req, res) => {
  const visitor = req.query.visitor_name || "Guest";
  const clientIp = req.ip === "::ffff:127.0.0.1" || req.ip === "127.0.0.1" ? null : req.ip;
 
  let location = "New York"; // Default location

  if (clientIp) {
    // Fetch location data from positionstack.com API
    const locationApiKey = process.env.POSITIONSTACK_API_KEY;
    const locationUrl = `http://api.positionstack.com/v1/reverse?access_key=${locationApiKey}&query=${clientIp}`;

    try {
      const locationResponse = await axios.get(locationUrl);
      const locationData = locationResponse.data.data[0];
      location = locationData.locality || locationData.region || location;
    } catch (error) {
      console.error("Location API Error:", error.response.data || error.message);
    }
  }

  // Fetch weather data from worldweatheronline.com API
  const weatherApiKey = process.env.WORLDWEATHERONLINE_API_KEY;
  const weatherUrl = `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=${weatherApiKey}&q=${location}&format=json`;

  try {
    const weatherResponse = await axios.get(weatherUrl);
    const temperature = weatherResponse.data.data.current_condition[0].temp_C;
    res.json({
      client_ip: clientIp || "127.0.0.1",
      location: location,
      greeting: `Hello ${visitor}, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error("Weather API Error:", error.response.data);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Export the app
//module.exports = app;


