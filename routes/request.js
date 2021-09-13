const express = require("express");
const { Request, validateRequest } = require("../models/requestModel");
const { User } = require("../models/userModel");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { sentToId } = req.body;

  const error = validateRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user._id === sentToId)
    return res.status(400).send("cannot send a request to yourself");

  const sentTo = await User.findById(sentToId);
  if (!sentTo) return res.status(400).send("invalid reciever Id");

  const alreadySent = await Request.find({
    "sentBy.user": req.user._id,
    "sentTo.user": sentToId,
  });
  if (alreadySent.length > 0)
    return res.status(400).send("request already sent");

  const sentBy = await User.findById(req.user._id);

  const request = new Request({
    sentBy: {
      profilePicture: sentBy.profilePicture,
      user: req.user._id,
      name: sentBy.firstName,
    },
    sentTo: {
      profilePicture: sentTo.profilePicture,
      user: sentToId,
      name: sentTo.firstName,
    },
  });
  try {
    const result = await request.save();
    console.log(result);
    res.status(200).send("ok");
  } catch (err) {
    console.log(err);
  }
});

router.delete("/", auth, async (req, res) => {
  const { sentToId } = req.body;

  const error = validateRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user._id === sentToId)
    return res.status(400).send("cannot send a request to yourself");

  const sentTo = await User.findById(sentToId);
  if (!sentTo) return res.status(400).send("invalid reciever Id");

  const sentOrNot = await Request.find({
    "sentBy.user": req.user._id,
    "sentTo.user": sentToId,
  });

  console.log(sentOrNot);
  if (sentOrNot.length < 1)
    return res.status(400).send("there is no such request");

  try {
    const result = await Request.findByIdAndDelete({ _id: sentOrNot[0]._id });
    console.log(result);
    res.status(200).send("friend request deleted");
  } catch (err) {
    console.log(err);
    res.status(400).send("something went wrong");
  }
});

router.put("/", auth, async (req, res) => {
  const { sentToId } = req.body;

  const error = validateRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user._id === sentToId)
    return res.status(400).send("cannot send a request to yourself");

  const sentTo = await User.findById(sentToId);
  if (!sentTo) return res.status(400).send("invalid reciever Id");

  const sentOrNot = await Request.find({
    "sentBy.user": req.user._id,
    "sentTo.user": sentToId,
  });

  // console.log(sentOrNot);
  if (sentOrNot.length < 1)
    return res.status(400).send("there is no such request");

  try {
    const result = await Request.findByIdAndUpdate(
      sentOrNot[0]._id,
      {
        accepted: true,
      },
      { new: true }
    );
    res.status(200).send("request accepted");
  } catch (err) {
    console.log(err);
    res.status(404).send("oops something went wrong");
  }
});

router.get("/pendingSent", auth, async (req, res) => {
  try {
    const requests = await Request.find({
      "sentBy.user": req.user._id,
      accepted: false,
    });
    res.status(200).send(requests);
  } catch (err) {
    console.log(err);
    res.status(404).send("something went wrong");
  }
});

router.get("/pendingRecieved", auth, async (req, res) => {
  try {
    const requests = await Request.find({
      "sentTo.user": req.user._id,
      accepted: false,
    });
    res.status(200).send(requests);
  } catch (err) {
    console.log(err);
    res.status(404).send("something went wrong");
  }
});

router.get("/accepted", auth, async (req, res) => {
  try {
    const requests = await Request.find({
      "sentTo.user": req.user._id,
      accepted: true,
    });
    const requests1 = await Request.find({
      "sentBy.user": req.user._id,
      accepted: true,
    });

    res.status(200).send(requests.concat(requests1));
  } catch (err) {
    console.log(err);
    res.status(404).send("something went wrong");
  }
});

router.get("/info", auth, async (req, res) => {
  const error = validateRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const request = await Request.findById(req.body.sentToId);
  if (!request) return res.status(400).send("no such request");

  let user;
  let isAccepted = false;
  if (req.user._id === request.sentBy.user) {
    if (request.accepted === true) {
      user = await User.findById(request.sentTo.user).select({
        hashed: 0,
        plan: 0,
      });
      isAccepted = true;
    } else {
      user = await User.findById(request.sentTo.user).select({
        hashed: 0,
        plan: 0,
        email: 0,
        mobile: 0,
      });
    }
    return res.status(200).send({ user: user, isAccepted: isAccepted });
  } else {
    if (request.accepted === true) {
      user = await User.findById(request.sentBy.user).select({
        hashed: 0,
        plan: 0,
      });
      isAccepted = true;
    } else {
      user = await User.findById(request.sentTo.user).select({
        hashed: 0,
        plan: 0,
        email: 0,
        mobile: 0,
      });
    }
    return res.status(200).send({ user: user, isAccepted: isAccepted });
  }
});
module.exports = router;
