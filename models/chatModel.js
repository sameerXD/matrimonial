const mongoose = require("mongoose");
const Joi = require("joi");
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
    user1:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    user2:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    messages:[
      {
        sent_by:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
        sent_to:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
        message: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 60,
        },
      }
    ]
  },{
    timestamps:true
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
