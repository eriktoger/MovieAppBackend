const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const User = require("../userSchema");

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const { favorites } = await User.findOne({ name: decoded.user }).select(
      "favorites -_id"
    );
    return res.send(favorites);
  } catch {
    return res.status(400).json({ error: "Favorites could not be retrieved" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newFavorite = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ name: decoded.user });
    if (user.favorites.includes((fav) => fav.imdbID === newFavorite.imdbID)) {
      return res.status(400).json({ error: "This move is already a favorite" });
    } else {
      user.favorites.push(newFavorite);
      user.save();
      return res.status(200).send();
    }
  } catch {
    return res
      .status(400)
      .json({ error: "Movie could not added to favorites" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const favoriteToRemove = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ name: decoded.user });
    user.favorites = user.favorites.filter(
      (fav) => fav.imdbID !== favoriteToRemove.imdbID
    );
    await user.save();
    return res.status(200).send();
  } catch {
    res
      .status(400)
      .json({ error: "Movie could not be removed from favorites" });
  }
});

module.exports = router;
