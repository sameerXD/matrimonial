const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const emailAuth = require("../middleware/emailAuth");
var nodemailer = require("nodemailer");
let config = require("config");

const {
  User,
  userSchema,
  validateUser,
  validateUpdateUser,
} = require("../models/userModel");

const { passwordStrength } = require("check-password-strength");
const { defaultOptions } = require("./passwordStrength/index");
const bcrypt = require("bcrypt");

const otps = [];

//mail config
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.get("email"),
    pass: config.get("password"),
  },
});

router.post("/register", async (req, res) => {
  // console.log(req.body);
  const {
    firstName,
    lastName,
    mobile,
    email,
    profileFor,
    plan,
    dateOfBirth,
    ft,
    inch,
    maritalStatus,
    language,
    religion,
    caste,
    gotra,
    city,
    jobSector,
    salary,
  } = req.body;
  const error = validateUser(req.body);
  if (error) return res.send(error.details[0].message);

  let passStrength = passwordStrength(req.body.password, defaultOptions);

  if (passStrength.value === "Too weak" || passStrength.value === "Weak")
    return res.status(400).send("password " + passStrength.value);

  const hashed = await encryptPass(req.body.password);

  const user = new User({
    firstName,
    lastName,
    mobile,
    email,
    profileFor,
    plan,
    dateOfBirth,
    height: {
      ft,
      inch,
    },
    maritalStatus,
    language,
    religion,
    caste,
    gotra,
    city,
    hashed,
    jobSector,
    salary,
  });

  try {
    const result = await user.save();
    const token = user.generateEmailAuth();

    //sending email
    var mailOptions = {
      from: config.get("email"),
      to: email,
      subject: "Sending Email using Node.js",
      text: "That was easy!",
      html: `<h1>Please click the link given bellow in your browser</h1><br>
          <a href = 'http://localhost:3000/emailAuth/${token}'>Link</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).send(result);
  } catch (error) {
    console.log("here ", error.code, error);
    if (error.code === 11000)
      return res
        .status(400)
        .send("already used " + Object.keys(error.keyValue)[0]);
    for (let field in error.errors) {
      res.status(400).send(error.errors[field].message);
    }
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-hashed");
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.status(404).send("oops something went wrong");
  }
});

router.get("/login", async (req, res) => {
  let hasProfilePicture = false;
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("user not found");

  if (!user.emailAuth)
    return res.status(400).send("please authenticate your email");

  if (req.body.password) {
    const passEqual = bcrypt.compareSync(req.body.password, user.hashed);
    if (!passEqual) return res.status(400).send("Password didnt match");

    const token = user.generateAuthToken();

    if (user.profilePicture && user.profilePicture.length > 1)
      hasProfilePicture = true;
    res.header("x-auth-token", token).status(200).send({
      token: token,
      hasProfilePicture: hasProfilePicture,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(400).send("password cant be empty");
  }
});

router.get("/changePassword/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).send("user not found");

  const token = user.generateEmailAuth();

  //sending email
  var mailOptions = {
    from: config.get("email"),
    to: req.params.email,
    subject: "Sending Email using Node.js",
    text: "That was easy!",
    html: `<h1>Please click the link given bellow in your browser</h1><br>
          <a href = 'http://localhost:3000/changePassword/${token}'>Link</a>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("please check your email to change password");
    }
  });
});

// router.get("/changePassword/:token", (req, res) => {
//   const otp = otps.find((o) => o.userName === req.params.userName);
//   if (!otp) return res.status(404).send("No otp for this userName");

//   console.log("otp found ", otp);

//   const millis = Date.now() - otp.date;
//   //console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
//   const timeElapsed = Math.floor(millis / 1000);
//   if (timeElapsed > 30) {
//     const index = otps.indexOf(otp);
//     otps.splice(index, 1);
//     return res.status(404).send("otp expired");
//   }

//   if (otp.otp !== req.body.otp) return res.status(400).send("otp Invalid");

//   res.status(200).send("correct otp");
//   //make jwt token here
// });

router.put("/changePassword/:token", emailAuth, async (req, res) => {
  let passStrength = passwordStrength(req.body.password, defaultOptions);

  if (passStrength.value === "Too weak" || passStrength.value === "Weak")
    return res.send(passStrength.value);

  const hashedPassword = await encryptPass(req.body.password);

  try {
    const result = await User.findByIdAndUpdate(
      req.userId._id,
      {
        hashed: hashedPassword,
      },
      { new: true }
    );
    console.log(result);
    res.status(200).send("password changed");
  } catch (err) {
    console.log(err);
    res.status(404).send("oops! something went wrong");
  }
});

router.put("/updateProfile", auth, async (req, res) => {
  //mongoose id will come from jwt
  const id = req.user._id;
  const validate = validateUpdateUser(req.body);
  if (validate) return res.status(400).send(validate.details[0].message);

  try {
    const result = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).send(result);
  } catch (err) {
    for (let field in err) {
      res.status(400).send(err.errors[field].message);
    }
  }
});

router.get("/emailAuth/:token", emailAuth, async (req, res) => {
  const result = await User.updateOne(
    { _id: req.userId._id },
    { emailAuth: true }
  );
  res.status(200).send("account is authenticated please login");
});

router.put("/updateProfilePicture", auth, async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.user._id },
      { profilePicture: req.body.profilePicture }
    );
    res.status(200).send("profile picture updated");
  } catch (err) {
    console.log(err);
    res.status(404).send("oops something went wrong");
  }
});

//functions
// encryptPass("Sameer@123");
async function encryptPass(myPlaintextPassword) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(myPlaintextPassword, salt);
  //console.log(hashedPassword);
  return hashedPassword;
}

function otpGenerator() {
  let numbers = "0123456789";
  let otp = "";

  for (let i = 0; i < 4; i++) {
    otp += numbers[Math.floor(Math.random() * 10)];
  }
  return otp;
}

module.exports = router;
