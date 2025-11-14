const { Problem } = require("../models/problem.model.js");
const { Mcq } = require("../models/mcq.model.js");
const { McqSubmission } = require("../models/mcqSubmission.model.js");
const { Submission } = require("../models/submission.model.js");
const { Registration } = require("../models/registration.model.js");
const { Assessment } = require("../models/assessment.model.js");
const { TeamScore } = require("../models/teamScore.model.js");
const { Team } = require("../models/team.model.js");
const { sendSubmissionToQueue } = require("../lib/queue.js");
const { generateAdminToken } = require("../lib/utils.js");
const { User } = require("../models/user.model.js");
const { Test } = require("../models/test.model.js");
const bcrypt = require("bcryptjs");

const upcomingOA = async (req, res) => {
  try {
    const currentTime = new Date();
    const oa = await Assessment.find({
      endTime: { $gt: currentTime },
    });
    if (!oa) throw new Error("Internal Server error");
    res.status(200).json({ oa: oa });
  } catch (error) {
    console.log("Error in dashboard controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const allOATakenPartIn = async (req, res) => {
  try {
    const user = req.user;
    const oaTakenPartIn = await Registration.find({
      user: user._id,
    });
    if (!oaTakenPartIn) throw new Error("Internal Server Error");
    res.status(200).json({ oa: oaTakenPartIn });
  } catch (error) {
    console.log("Error in dashboard controller");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const problemSolved = async (req, res) => {
  try {
    const user = req.user;
    const result = await Submission.aggregate([
      {
        $match: {
          user: user._id, // the user's ObjectId
          status: "Accepted", // only accepted submissions
        },
      },
      {
        $group: {
          _id: "$problem", // group by unique problem
        },
      },
      {
        $count: "totalSolved", // count unique problems
      },
    ]);
    if (!result) {
      return res.status(500).json({ message: "Internal Server Error..." });
    }
    if (result[0])
      res.status(200).json({ problemSolved: result[0].totalSolved });
    else res.status(200).json({ problemSolved: 0 });
  } catch (erorr) {
    console.log("Error in problem solved controller");
    res.status(500).json({ message: "Internal Server Error....." });
  }
};

module.exports = {
  upcomingOA,
  allOATakenPartIn,
  problemSolved,
};
