const mongoose = require("mongoose");
const Joi = require("Joi");
Joi.objectId = require("joi-objectid")(Joi);

mongoose
  .connect("mongodb://localhost/matrimonial", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connected to mongoDb for request"))
  .catch((err) => console.error("could not connsect to mongoDb", err));

const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    wasPresent: {
      type: Boolean,
      default: false,
    },
  })
);

function validateChat(data) {
  const schema = Joi.object({
    userId: Joi.objectId(),
  });
  const { error } = schema.validate(data);
  return error;
}
module.exports.Chat = Chat;
module.exports.validateChat = validateChat;
