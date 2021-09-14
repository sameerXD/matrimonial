const Joi = require("Joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

mongoose
  .connect("mongodb://localhost/matrimonial", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connected to mongoDb"))
  .catch((err) => console.error("could not connsect to mongoDb", err));

const languages = [
  "hindi",
  "english",
  "urdu",
  "bengali",
  "marathi",
  "telugu",
  "tamil",
  "gujarati",
  "kannada",
  "odia",
  "malyalam",
  "punjabi",
  "sanskrit",
  "other",
];

const religions = [
  "muslim",
  "hindu",
  "sikh",
  "budhist",
  "christian",
  "jain",
  "jewish",
  "bahai",
  "other",
];

const gotras = ["agasthi", "ashvatya"];
const castes = ["brahmin", "kshatriyas", "vaishyas", "shudras"];

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
  },
  mobile: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
    unique: true,
  },

  profileFor: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
    enum: [
      "Myself",
      "Daughter",
      "Son",
      "Sister",
      "Brother",
      "Relative",
      "Friend",
    ],
  },
  plan: {
    type: String,
    minlength: 1,
    maxlength: 60,
    trim: true,
    required: true,
    enum: ["bronze", "silver", "gold"],
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  height: {
    ft: {
      type: Number,
      required: true,
      trim: true,
      max: 10,
      min: 0,
    },
    inch: {
      type: Number,
      required: true,
      trim: true,
      max: 100,
      min: 0,
    },
  },
  maritalStatus: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Never Married",
      "Awaiting Divorce",
      "Divorced",
      "Widowed",
      "Annulled",
    ],
  },
  language: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: languages,
  },
  religion: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: religions,
  },
  caste: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: castes,
  },
  gotra: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: gotras,
  },
  city: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 5,
    maxlength: 60,
  },
  hashed: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
  },
  profilePicture: {
    type: String,
    minlength: 0,
    maxlength: 230,
  },
  jobSector: {
    type: String,
    minlength: 5,
    maxlength: 60,
    trim: true,
    required: true,
  },
  salary: {
    type: Number,
    min: 0,
    required: true,
  },
  emailAuth: {
    type: Boolean,
    required: true,
    default: false,
  },
});

//creating jwt token for logged in users
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  return token;
};

//creating jwt token for email auth
userSchema.methods.generateEmailAuth = function () {
  const emailToken = jwt.sign(
    { _id: this._id },
    config.get("jwtPrivateKeyForEmail")
  );
  return emailToken;
};

const User = mongoose.model("User", userSchema);

function validateUser(data) {
  const schema = Joi.object({
    firstName: Joi.string().min(5).max(60).required(),
    email: Joi.string()
      .email()
      .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .required()
      .min(5)
      .max(60),
    lastName: Joi.string().min(5).max(60).required(),
    password: Joi.string().min(5).max(60).required(),
    confirmPassword: Joi.string()
      .min(5)
      .max(60)
      .valid(Joi.ref("password"))
      .required(),
    profileFor: Joi.string().min(5).max(60).required(),
    dateOfBirth: Joi.date().required(),
    ft: Joi.number().min(0).max(10).required(),
    inch: Joi.number().min(0).max(100).required(),
    maritalStatus: Joi.string().min(5).max(60).required(),
    language: Joi.string().min(5).max(60).required(),
    religion: Joi.string().min(5).max(60).required(),
    caste: Joi.string().min(5).max(60).required(),
    gotra: Joi.string().min(5).max(60).required(),
    city: Joi.string().min(5).max(60).required(),
    plan: Joi.string().min(1).max(60).required(),
    mobile: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    profilePicture: Joi.string().min(0).max(230),
    jobSector: Joi.string().min(5).max(60).required(),
    salary: Joi.number().min(0).required(),
  });
  const { error } = schema.validate(data);
  return error;
}

function validateUpdateUser(data) {
  const schema = Joi.object({
    firstName: Joi.string().min(5).max(60).required(),
    // email: Joi.string()
    //   .email()
    //   .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    //   .required()
    //   .min(5)
    //   .max(60),
    lastName: Joi.string().min(5).max(60).required(),
    // profilePicture: Joi.string().min(0).max(230),

    // password: Joi.string().min(5).max(60).required(),
    // confirmPassword: Joi.string()
    //   .min(5)
    //   .max(60)
    //   .valid(Joi.ref("password"))
    //   .required(),
    // profileFor: Joi.string().min(5).max(60).required(),
    dateOfBirth: Joi.date().required(),
    ft: Joi.number().min(0).max(10).required(),
    inch: Joi.number().min(0).max(100).required(),
    maritalStatus: Joi.string().min(5).max(60).required(),
    language: Joi.string().min(5).max(60).required(),
    religion: Joi.string().min(5).max(60).required(),
    caste: Joi.string().min(5).max(60).required(),
    gotra: Joi.string().min(5).max(60).required(),
    city: Joi.string().min(5).max(60).required(),
    // plan: Joi.string().min(1).max(60).required(),
    // mobile: Joi.string()
    //   .length(10)
    //   .pattern(/^[0-9]+$/)
    //   .required(),
    jobSector: Joi.string().min(5).max(60).required(),
    salary: Joi.number().min(0).required(),
  });
  const { error } = schema.validate(data);
  return error;
}

module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateUpdateUser = validateUpdateUser;
