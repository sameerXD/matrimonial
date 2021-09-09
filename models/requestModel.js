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

const requestSchema = new mongoose.Schema({
  sentBy: {
    profilePicture: {
      type: String,
      minlength: 0,
      maxlength: 230,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 60,
    },
  },
  sentTo: {
    profilePicture: {
      type: String,
      minlength: 0,
      maxlength: 230,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 60,
    },
  },
  accepted: {
    type: Boolean,
    default: false,
  },
});

const Request = mongoose.model("Request", requestSchema);

function validateRequest(data) {
  const schema = Joi.object({
    sentToId: Joi.objectId().required(),
  });
  const { error } = schema.validate(data);
  return error;
}

module.exports.Request = Request;
module.exports.validateRequest = validateRequest;
