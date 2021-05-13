const app = require("./app");
const port = 4000;
const connectDB = require("./db");
connectDB();
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
