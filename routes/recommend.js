const express = require("express");
const router = express.Router();

//models
const { User } = require("../models/userModel");
const { Request } = require("../models/requestModel");

//middleware
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const twenty_users = await User.find().select({ profilePicture: 1 });

  const requests = await Request.find({
    $and: [
      {
        $or: [{ "sentTo.user": req.user._id }, { "sentBy.user": req.user._id }],
      },
      { accepted: true },
    ],
  });

  if (requests.length < 1) return res.status(200).send(twenty_users);
  const canBeSent = [];
  for (let us of twenty_users) {
    for (let re of requests) {
      if (re.sentBy.user.equals(us._id) || re.sentTo.user.equals(us._id)) {
      } else {
        canBeSent.push({
          _id: us._id,
          profilePicture: us.profilePicture,
        });
      }
    }
  }

  res.status(200).send(canBeSent);
});

module.exports = router;
