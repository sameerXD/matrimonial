const express = require("express");
const { User } = require("../models/userModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { location, dateOfBirth, salary, jobSector } = req.body;
  console.log(location, jobSector, salary, dateOfBirth);
  var re = new RegExp(req.body, "i");

  const result = await User.find({
    $or: [
      {
        $and: [{ city: { $regex: re } }, { jobSector: { $regex: re } }],
      },
      {
        $and: [
          { salary: { $gte: salary } },
          {
            dateOfBirth: {
              $gte: Date(dateOfBirth + "-01-01T00:00:00.000Z"),
              $lt: Date(dateOfBirth + "-01-01T00:00:00.000Z"),
            },
          },
        ],
      },
    ],
  });
  console.log(result);
  if (!result || result.length < 1)
    return res.status(200).send("there are no results");
  res.status(200).send(result);
});

module.exports = router;
