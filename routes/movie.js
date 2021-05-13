const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:title", async (req, res) => {
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
    return res.json(movie);
  } catch {
    return res.status(500).json({ error: "Movie search failed" });
  }
});

module.exports = router;
