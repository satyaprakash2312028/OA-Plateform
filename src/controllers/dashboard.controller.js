const {Problem} = require("../models/problem.model.js");
const {Mcq} = require("../models/mcq.model.js");
const {McqSubmission} = require("../models/mcqSubmission.model.js");
const {Submission} = require("../models/submission.model.js");
const {Registration} = require("../models/registration.model.js");
const { Assessment } = require("../models/assessment.model.js");
const {TeamScore} = require("../models/teamScore.model.js");
const {Team} = require("../models/team.model.js");
const {sendSubmissionToQueue} = require("../lib/queue.js");
const {generateAdminToken} = require("../lib/utils.js");
const { User } = require("../models/user.model.js");
const { Test } = require("../models/test.model.js");
const bcrypt = require("bcryptjs");

const upcomingOA = async (req, res) =>{
    try{
        const currentTime = new Date();
        const oa = await Assessment.find({
        endTime: { $gt: currentTime }
        });
        if(!oa) throw new Error("Internal Server error");
        res.status(200).json({oa:oa});
    }catch(error){
        console.log("Error in dashboard controller", error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

const allOATakenPartIn = async(req, res)=>{
    try{
        const user = req.user;
        const oaTakenPartIn = await Registration.find({
            user: user._id
        });
        if(!oaTakenPartIn) throw new Error("Internal Server Error");
        res.status(200).json({oa: oaTakenPartIn});
    }catch(error){
        console.log("Error in dashboard controller");
        res.status(500).json({message:"Internal Server Error"});
    }
} 

const problemSolved = async(req, res)=>{
    try{
        const result = await Submission.aggregate([
        // --- Stage 1: Filter ---
        // Find all submissions by the specified user that have a status of "Accepted".
        // This should use the compound index on {user, status}.
        {
            $match: {
            user: userId,
            status: 'Accepted'
            }
        },

        // --- Stage 2: Group by Problem ---
        // Group documents by the 'problem' field to find unique problems.
        // We don't need to sort first, and we only need the _id.
        // This is very lightweight.
        {
            $group: {
            _id: "$problem" // Group by the problem ID
            }
        },

        // --- Stage 3: Count ---
        // Count the number of unique groups (which equals the number of unique problems).
        {
            $count: "uniqueAcceptedCount" // The output field name
        }
        ]);
        if(!result||!result[0]){
            return res.status(500).json({message:"Internal Server Error"});
        }
        res.status(200).json({problemSolved:result[0].lenght});
    }catch(erorr){
        console.log("Error in problem solved controller");
        res.status(500).json({message:"Internal Server Error"});
    }
}

module.exports = {
    upcomingOA,
    allOATakenPartIn
}