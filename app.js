const express = require("express");
const app = express();
const expressJWT = require("express-jwt");
const bodyParser = require("body-parser");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
const favorites = require("./routes/favorites");
const movie = require("./routes/movie");
const user = require("./routes/user");

app.use(
  expressJWT({ secret: jwtSecret, algorithms: ["HS256"] }).unless({
    path: ["/user/login", "/user/create"],
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use("/favorites", favorites);
app.use("/movie", movie);
app.use("/user", user);

module.exports = app;
