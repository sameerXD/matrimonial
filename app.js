const express = require("express");
const app = express();
const config = require("config");

//routes
const authenticate = require("./routes/authenticate");
const request = require("./routes/request");
const search = require("./routes/search");

if (!config.get("jwtPrivateKey")) {
  console.error("Fetal ERROR: jwtPrivateKey Is Not Defined");
  process.exit(1);
}

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authenticate);
app.use("/request", request);
app.use("/search", search);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening to port ${port}....`);
});
