const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    req.isLogin = false;
    next();
  } else {
    try {
      const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
      req.user = decoded;
      req.isLogin = true;
      next();
    } catch (ex) {
      return res.status(400).send("invalid token");
    }
  }
};
