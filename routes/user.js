const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const User = require("../userSchema");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const result = bcrypt.compareSync(req.body.password, user.password);

    if (result) {
      const token = jwt.sign({ user: req.body.name }, jwtSecret, {
        algorithm: "HS256",
      });
      return res.json({ token, name: user.name });
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch {
    return res.status(400).json({ error: "Login failed!" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user) {
      return res.status(400).json({ error: "Username not available" });
    }
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      name: req.body.name,
      favorites: [],
      password: hash,
    });
    await newUser.save();

    const token = jwt.sign({ user: req.body.name }, jwtSecret, {
      algorithm: "HS256",
    });
    return res.json({ token, name: req.body.name });
  } catch {
    return res.status(400).json({ error: "Account could not be created" });
  }
});

module.exports = router;
