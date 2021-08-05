const express = require("express");
const app = express();
const authenticate = require("./routes/authenticate");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authenticate);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening to port ${port}....`);
});
