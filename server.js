const app = require("./app");
const port = 4000;
const connectDB = require("./db/db.js");
connectDB();

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
