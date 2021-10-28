const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getAsync, redisClient } = require("../db/redis.js");

router.get("/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const movie = await getAsync(title);
    if (movie) {
      const parsedMovie = JSON.parse(movie);
      return res.status(200).json(parsedMovie);
    }
  } catch (error) {
    console.log({ error });
  }

  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?apikey=${process.env.OMDBKEY}&t=${req.params.title}`
    );
    if (!response?.data?.Title) {
      return res.status(404).json({ error: "Movie not found" });
    }
    const movie = {
      title: response.data.Title,
      released: response.data.Released,
      posterUrl: response.data.Poster,
      ratings: response.data.Ratings,
      imdbID: response.data.imdbID,
      plot: response.data.Plot,
    };
    redisClient.set(title, JSON.stringify(movie));

    //this modification should only be handled by BE
    const realTitle = response.data.Title.trim().split(" ").join("+");
    if (title !== realTitle) {
      redisClient.set(realTitle, JSON.stringify(movie));
    }
    return res.status(200).json(movie);
  } catch {
    return res.status(500).json({ error: "Movie search failed" });
  }
});

module.exports = router;
