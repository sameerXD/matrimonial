const express = require("express");
const router = express.Router();
const Joi = require("Joi");
const { passwordStrength } = require("check-password-strength");
const { defaultOptions } = require("./passwordStrength/index");
const bcrypt = require("bcrypt");

const users = [];
const otps = [];

router.post("/register", async (req, res) => {
  console.log(req.body);
  const { error } = validateData(req.body);
  if (error) return res.send(error.details[0].message);

  let passStrength = passwordStrength(req.body.password, defaultOptions);

  if (passStrength.value === "Too weak" || passStrength.value === "Weak")
    return res.send(passStrength.value);

  const hashedPassword = await encryptPass(req.body.password);
  req.body.id = users.length + 1;
  req.body.hashedPassword = hashedPassword;
  users.push(req.body);
  res.send(users);
});

router.get("/", (req, res) => {
  res.send(users);
});

router.get("/login", (req, res) => {
  const user = users.find((u) => u.userName === req.body.userName);
  if (!user) return res.status(404).send("user not found");

  const passEqual = bcrypt.compareSync(req.body.password, user.hashedPassword);
  if (!passEqual) return res.status(400).send("Password didnt match");
  res.status(200).send("login successfull");
});

router.post("/changePassword/:userName", (req, res) => {
  const user = users.find((u) => u.userName === req.params.userName);
  if (!user) return res.status(404).send("username does not exist!");
  const OTP = otpGenerator();
  const otp = {
    userName: req.params.userName,
    otp: OTP,
    date: Date.now(),
    id: otps.length + 1,
  };
  otps.push(otp);
  res.send(otp);
});

router.get("/changePassword/:userName", (req, res) => {
  const otp = otps.find((o) => o.userName === req.params.userName);
  if (!otp) return res.status(404).send("No otp for this userName");

  console.log("otp found ", otp);

  const millis = Date.now() - otp.date;
  //console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
  const timeElapsed = Math.floor(millis / 1000);
  if (timeElapsed > 30) return res.status(404).send("otp expired");

  if (otp.otp !== req.body.otp) return res.status(400).send("otp Invalid");
  res.status(200).send("correct otp");
  //make jwt token here
});

router.put("/changePassword/:userName", async (req, res) => {
  const user = users.find((u) => u.userName === req.params.userName);
  if (!user) return res.status(404).send("username does not exist!");
  req.body.userName = req.params.userName;
  const { error } = validateData(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let passStrength = passwordStrength(req.body.password, defaultOptions);

  if (passStrength.value === "Too weak" || passStrength.value === "Weak")
    return res.send(passStrength.value);

  const hashedPassword = await encryptPass(req.body.password);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.hashedPassword = hashedPassword;
  res.status(200).send(user);
});

//functions

function validateData(data) {
  const schema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
    createProfileFor: Joi.string().min(3).required(),
    dateOfBirth: Joi.date().required(),
    height: Joi.number().required(),
    maritalStatus: Joi.string().min(3).required(),
    motherTongue: Joi.string().min(3).required(),
    religion: Joi.string().min(3).required(),
    city: Joi.string().min(3).required(),
    mobileNumber: Joi.string().min(3).required(),
    gotrh: Joi.string().min(3).required(),
  });
  return schema.validate(data);
}

async function encryptPass(myPlaintextPassword) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(myPlaintextPassword, salt);
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
