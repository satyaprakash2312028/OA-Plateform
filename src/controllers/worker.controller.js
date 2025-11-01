const {Submission} = require("../models/submission.model.js");
const {TeamScore} = require("../models/teamScore.model.js");
const {Registration} = require("../models/registration.model.js");
const {io, getReceiverSocketId}  = require('../lib/socket.js');
const getJudgeVedict = async(req, res) => {
    try{
        const {submissionId, verdict, executionTime, memoryUsed, status} = req.body;
        const submission = await Submission.findByIdAndUpdate(submissionId, {
            status: verdict,
            executionTime,
            memoryUsed
        });
        if(!submission) return res.status(404).json({message: "Submission not found"});
        const userSocketId = getReceiverSocketId(submission.user);
        if(userSocketId){
            io.to(userSocketId).emit("statusUpdate", {submissionId, status});
        }
        // Update team score if submission is accepted and linked to an assessment
        if(submission.assesment&&(verdict==="Accepted")){
            const alreadySolved = await Submission.findOne({
                user: submission.user,
                problem: submission.problem,
                assesment: submission.assesment,
                status: "Accepted",
                _id: { $ne: submission._id } // Exclude current submission
            });
            if(alreadySolved){
                return res.status(200).json({message: "Judge vedict processed successfully"});
            }
            const teamId = await Registration.findOne({assessment: submission.assesment, user: submission.user}).select("_id");
            if(!teamId) return res.status(404).json({message: "Team not found for this submission"});
            await TeamScore.findOneAndUpdate({team: teamId, assessment: submission.assesment}, {
                $inc: {score: 7}
            });
        }
        res.status(200).json({message: "Judge vedict processed successfully"});
    }catch(error){
        console.log("Error in getJudgeVedict controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }   
}

const getStatus = async(req, res) => {
    try{
        const {submissionId, status} = req.body;
        const submission = await Submission.findById(submissionId);
        if(!submission) return res.status(404).json({message: "Submission not found"});
        const userId = submission.user;
        const userSocketId = getReceiverSocketId(userId);
        if(userSocketId){
            io.to(userSocketId).emit("statusUpdate", {submissionId, status});
        }
        res.status(200).json({message: "Status update sent successfully"});
    }catch(error){
        console.log("Error in getStatus controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {getJudgeVedict, getStatus};