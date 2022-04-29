const express = require("express");
const app = express();
const config = require("config");

//routes
const authenticate = require("./routes/authenticate");
const request = require("./routes/request");
const search = require("./routes/search");
const recommend = require("./routes/recommend");
const chat = require("./routes/chat");
const chats = require("./routes/chats")
if (
  !config.get("jwtPrivateKey") ||
  !config.get("jwtPrivateKeyForEmail") ||
  !config.get("email") ||
  !config.get("password")
) {
  console.error("Fetal ERROR: jwtPrivateKey Is Not Defined");
  process.exit(1);
}


//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authenticate);
app.use("/request", request);
app.use("/search", search);
app.use("/recommend", recommend);
app.use("/chat", chat);
app.use("/chats", chats);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening to port ${port}....`);
});
