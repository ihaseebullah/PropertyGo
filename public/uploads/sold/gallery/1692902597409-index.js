var express = require("express");

var app = express();
const axios = require("axios");
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  // Example usage
  const numberOfPhotos = 5;
  fetchRandomPhotos(numberOfPhotos)
    .then((photos) => {
      res.render("index", { photos: photos });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

const apiKey = "EvyN2ikctbvFM8W7FcJGgwbT8nTDK3uVTCPOZE3QIO0";
const unsplashApi = axios.create({
  baseURL: "https://api.unsplash.com/",
  headers: {
    "Accept-Version": "1.0",
    Authorization: "Client-ID " + apiKey,
  },
});

async function fetchRandomPhotos(count) {
  try {
    const response = await unsplashApi.get("/photos/random", {
      params: {
        count: count,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

app.listen(3000, function () {
  console.log("Listening on port 3000...");
});
