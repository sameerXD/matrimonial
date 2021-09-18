const express = require("express");
const { User } = require("../models/userModel");
const { Request } = require("../models/requestModel");
const { Chat, validateChat } = require("../models/chatModel");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const err = validateChat(req.body);
  if (err) return res.status(400).send("invalid user id");

  const request = await Request.findOne({
    "sentBy.user": req.body.userId,
    "sentTo.user": req.user._id,
    accepted: true,
  });
  const request1 = await Request.findOne({
    "sentBy.user": req.user._id,
    "sentTo.user": req.body.userId,
    accepted: true,
  });

  if (!request && !request1) return res.status(400).send("not friends");

  let str = req.body.userId + req.user._id;
  let str1 = req.user._id + req.body.userId;

  let dupKey = await Chat.findOne({ chatId: str1 });
  if (dupKey) return res.status(200).send({ chatId: str1 });
  const chatIdSchema = new Chat({
    chatId: str,
  });
  try {
    const chatId = await chatIdSchema.save();
    console.log(chatId);
  } catch (err) {
    if (err.code === 11000) return res.status(200).send({ chatId: str });
    return res.status(404).send("something went wrong !");
  }
  return res.status(200).send({ chatId: str });
});

module.exports = router;
