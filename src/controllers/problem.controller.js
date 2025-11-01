const {Problem} = require("../models/problem.model.js");
const {Mcq} = require("../models/mcq.model.js");
const {McqSubmission} = require("../models/mcqSubmission.model.js");
const {Submission} = require("../models/submission.model.js");
const {Registration} = require("../models/registration.model.js");
const { Assessment } = require("../models/assessment.model.js");
const {TeamScore} = require("../models/teamScore.model.js");
const {Team} = require("../models/team.model.js");
const {sendSubmissionToQueue} = require("../lib/queueManager.js");


const submitProblem = async(req, res) => {
    try{
        const user = req.user;
        const {problemId, code, language, assessmentID} = req.body;
        if(code.trim().length<=0) res.status(400).json({message: "Code cannot be empty"});
        if(language.trim().length<=0) res.status(400).json({message: "Language cannot be empty"});
        if(language!="python" && language!="javascript" && language!="cpp"&& language!="java"){
            return res.status(400).json({message: "Unsupported language"});
        }
        const problem = await Problem.findById(problemId);
        if(!problem) return res.status(404).json({message: "Problem not found"});
        if(assessmentID){
            const assessment = await Problem.findById(assessmentID);
            if(!assessment) return res.status(404).json({message: "Assessment not found"});
            if(!problem.isPrivate) return res.status(400).json({message: "Problem is not part of any assessment"});
            if(assessmentID!= problem.assessment.toString()){
                return res.status(400).json({message: "Problem is not part of the specified assessment"});
            }
            const registration = await Registration.findOne({assessment: assessmentID, user: user._id});
            if(!registration) return res.status(403).json({message: "You are not registered for this assessment"});
            if(Date.now()<assessment.startTime) return res.status(403).json({message: "Assessment hasn't started yet"});
            if(Date.now()>assessment.endTime) return res.status(403).json({message: "Assessment has ended"});
            const newSubmission  = new Submission({
                user: user._id,
                problem: problem._id,
                assesment: assessment._id,
                code,
                language,
                status: "Pending"
            });
            if(newSubmission) await newSubmission.save();
            else return res.status(500).json({message: "Could not create submission"});
            await sendSubmissionToQueue(newSubmission);
            return  res.status(201).json({message: "Submission received", submissionId: newSubmission._id});
        }else{
            if(problem.isPrivate){
                return res.status(403).json({message: "Problem is private and can only be submitted as part of an assessment"});
            }
            const submission = new Submission({
                user: user._id,
                problem: problem._id,
                code,
                language,
                status: "Pending"
            });
            if(submission) await submission.save();
            else return res.status(500).json({message: "Could not create submission"});
            await sendSubmissionToQueue(submission);
            res.status(201).json({message: "Submission received", submissionId: submission._id});
        }
    }catch(error){
        console.log("Error in submit controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Endpoint for online judge Code submission

// 'Pending', // Waiting in the queue
// 'Judging', // Actively being processed by a worker
// 'Accepted', // Passed all test cases
// 'Wrong Answer',
// 'Time Limit Exceeded',
// 'Memory Limit Exceeded',
// 'Compilation Error',
// 'Runtime Error', // e.g., segfault, unhandled exception
// 'Internal Error' // Error within the judge system itself




const submitMcq = async(req, res) => {
    try{
        const user = req.user;
        const {mcqId, optionSelected} = req.body;
        const mcq = await Mcq.findById(mcqId);
        if(!mcq) return res.status(404).json({message: "MCQ not found"});   
        if(optionSelected<0 || optionSelected>=mcq.options.length){
            return res.status(400).json({message: "Invalid option selected"});
        }
        
        if(!mcq.assessment) {
            return res.status(400).json({message: "MCQ is not part of any assessment"});
        }
        const assessment = await Assessment.findById(mcq.assessment);
        if(!assessment) return res.status(404).json({message: "Assessment not found"});
        const registration = await Registration.findOne({assessment: mcq.assessment, user: user._id});
        if(!registration) return res.status(403).json({message: "You are not registered for this assessment"});
        if(Date.now()<assessment.startTime) return res.status(403).json({message: "Assessment hasn't started yet"});
        if(Date.now()>assessment.endTime) return res.status(403).json({message: "Assessment has ended"});
        const mcqSubmission = new McqSubmission({
            user: user._id,
            mcq: mcq._id,
            optionSelected,
            isCorrect: mcq.correctOptionIndex===optionSelected
        });
        if(mcqSubmission) await mcqSubmission.save();
        else return res.status(500).json({message: "Could not create MCQ submission"}); 
        if(mcqSubmission.isCorrect){
            const previousSubmissions = await McqSubmission.findOne({
                user: user._id,
                mcq: mcq._id,
                isCorrect: true,
                _id: { $ne: mcqSubmission._id } // Exclude current submission
            });

            if(!previousSubmissions) await TeamScore.findByIdAndUpdate({team: registration.team, assessment: mcq.assessment}, {
                $inc: {score: 1}
            });
        }
        res.status(201).json({message: "MCQ Submission received", mcqSubmissionId: mcqSubmission._id});
    }catch(error){
        console.log("Error in MCQ submit controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const getOAssessments = async(req, res) => {
    try{
        const user = req.user;
        const {assessmentId} = req.params;
        if(!assessmentId) return res.status(400).json({message: "Assessment ID is required"});
        const registration = await Registration.findOne({assessment: assessmentId, user: user._id});
        if(!registration) return res.status(403).json({message: "You are not registered for this assessment"});
        if(Date.now()<registration.assessment.startTime) return res.status(403).json({message: "Assessment hasn't started yet"});

        const problems = await Problem.find({assessment: assessmentId});
        const mcqs = await Mcq.find({assessment: assessmentId});
        res.status(200).json({problems, mcqs});
    }catch(error){
        console.log("Error in getOAssessments controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const getSubmissions = async(req, res) => {
    try{
        const user = req.user;
        const {assessmentId} = req.body;
        if(assessmentId){
            const submissions = await Submission.find({user: user._id, assesment: assessmentId});
            res.status(200).json({submissions});
        }else{
            const submissions = await Submission.find({user: user._id});
            res.status(200).json({submissions});
        }
    }catch(error){
        console.log("Error in getSubmissions controller.", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



module.exports = {
    submitProblem,
    submitMcq,
    getOAssessments,
    getSubmissions,
};