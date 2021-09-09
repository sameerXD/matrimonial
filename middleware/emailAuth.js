const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.params.token;
  if (!token) return res.status(400).send("access denied!");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKeyForEmail"));
    req.userId = decoded;
    next();
  } catch (err) {
    return res.status(400).send("invalid token");
  }
};
